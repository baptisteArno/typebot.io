import { createId } from "@paralleldrive/cuid2";
import { chatsLimits, proChatTiers } from "@typebot.io/billing/constants";
import { getChatsLimit } from "@typebot.io/billing/helpers/getChatsLimit";
import { sendAlmostReachedChatsLimitEmail } from "@typebot.io/emails/transactional/AlmostReachedChatsLimitEmail";
import { sendBillingCycleResetEmail } from "@typebot.io/emails/transactional/BillingCycleResetEmail";
import { sendBillingCycleResetFailedEmail } from "@typebot.io/emails/transactional/BillingCycleResetFailedEmail";
import { sendReachedChatsLimitEmail } from "@typebot.io/emails/transactional/ReachedChatsLimitEmail";
import { env } from "@typebot.io/env";
import { isDefined, isEmpty } from "@typebot.io/lib/utils";
import { Plan, WorkspaceRole } from "@typebot.io/prisma/enum";
import type { Prisma } from "@typebot.io/prisma/types";
import prisma from "@typebot.io/prisma/withReadReplica";
import type { TelemetryEvent } from "@typebot.io/telemetry/schemas";
import { trackEvents } from "@typebot.io/telemetry/trackEvents";
import type { Workspace } from "@typebot.io/workspaces/schemas";
import Stripe from "stripe";

const LIMIT_EMAIL_TRIGGER_PERCENT = 0.75;

export const checkAndReportLastHourResults = async () => {
  console.log("Get collected results from the last hour...");

  const typebotIdsWithResults = await getLastHourActiveTypebotIds();

  console.log(
    `Found ${typebotIdsWithResults.length} typebots with results collected for the last hour.`,
  );

  const workspaces = await prisma.workspace.findMany({
    where: {
      typebots: {
        some: {
          id: { in: typebotIdsWithResults },
        },
      },
    },
    select: {
      id: true,
      name: true,
      typebots: { select: { id: true } },
      members: {
        select: { user: { select: { id: true, email: true } }, role: true },
      },
      additionalStorageIndex: true,
      customChatsLimit: true,
      customStorageLimit: true,
      plan: true,
      isQuarantined: true,
      chatsLimitFirstEmailSentAt: true,
      chatsLimitSecondEmailSentAt: true,
      stripeId: true,
      chatsHardLimit: true,
    },
  });

  if (isEmpty(env.STRIPE_SECRET_KEY))
    throw new Error("Missing STRIPE_SECRET_KEY env variable");

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-09-30.acacia",
  });

  const limitWarningEmailEvents: TelemetryEvent[] = [];
  const quarantineEvents: TelemetryEvent[] = [];
  const autoUpgradeEvents: TelemetryEvent[] = [];
  const billingCycleResetEvents: TelemetryEvent[] = [];

  for (const workspace of workspaces) {
    if (workspace.isQuarantined) continue;
    const chatsLimit = getChatsLimit(workspace);
    const subscription = await getSubscription(workspace, { stripe });
    const { totalChatsUsed } = await getUsage({
      workspaceId: workspace.id,
      subscription,
    });
    if (chatsLimit === "inf") continue;

    limitWarningEmailEvents.push(
      ...(await sendLimitWarningEmails({
        chatsLimit,
        totalChatsUsed,
        workspace,
      })),
    );

    const isUsageBasedSubscription = isDefined(
      subscription?.items.data.find(
        (item) =>
          item.price.id === env.STRIPE_STARTER_PRICE_ID ||
          item.price.id === env.STRIPE_PRO_PRICE_ID,
      ),
    );

    if (
      isUsageBasedSubscription &&
      subscription &&
      (workspace.plan === "STARTER" || workspace.plan === "PRO")
    ) {
      if (workspace.plan === "STARTER" && totalChatsUsed >= 4000) {
        console.log(
          "Workspace has more than 4000 chats, automatically upgrading to PRO plan",
        );
        const autoUpgradeResult = await autoUpgradeToPro(subscription, {
          stripe,
          workspaceId: workspace.id,
        });
        if (autoUpgradeResult.status === "success") {
          autoUpgradeEvents.push(
            ...workspace.members
              .filter((member) => member.role === WorkspaceRole.ADMIN)
              .map((member) => ({
                name: "Subscription automatically updated" as const,
                userId: member.user.id,
                workspaceId: workspace.id,
                data: {
                  plan: Plan.PRO,
                },
              })),
          );
          await reportUsageToStripe(totalChatsUsed, {
            stripe,
            subscription: autoUpgradeResult.newSubscription,
          });
        } else if (
          autoUpgradeResult.status === "error" &&
          autoUpgradeResult.reason === "payment_required"
        ) {
          console.log(
            `Workspace ${workspace.id} has more than 4000 chats, but payment is required to upgrade to PRO plan, automatically quarantining workspace...`,
          );
          await prisma.workspace.updateMany({
            where: { id: workspace.id },
            data: { isQuarantined: true },
          });
          quarantineEvents.push(
            ...workspace.members
              .filter((member) => member.role === WorkspaceRole.ADMIN)
              .map((member) => ({
                name: "Workspace automatically quarantined" as const,
                userId: member.user.id,
                workspaceId: workspace.id,
                data: {
                  reason: "auto upgrade payment failed" as const,
                },
              })),
          );
        }
      } else {
        await reportUsageToStripe(totalChatsUsed, { stripe, subscription });

        if (workspace.plan === "PRO") {
          const isSuspicious = await isSuspiciousWorkspace(
            subscription,
            totalChatsUsed,
            workspace.plan,
            { stripe },
          );

          if (isSuspicious) {
            console.log(
              `Suspicious Pro workspace ${workspace.id} collected ${totalChatsUsed} chats, resetting billing cycle...`,
            );
            const adminMembers = workspace.members.filter(
              (member) => member.role === WorkspaceRole.ADMIN,
            );
            const adminEmails = adminMembers
              .map((member) => member.user.email)
              .filter(isDefined);

            try {
              await chargeAndResetBillingCycle(subscription, { stripe });
              console.log(
                `Successfully reset billing cycle for workspace ${workspace.id}`,
              );
              await sendBillingCycleResetEmail({
                to: adminEmails,
                workspaceName: workspace.name,
                totalChatsUsed,
                url: `${process.env.NEXTAUTH_URL}/typebots?workspaceId=${workspace.id}`,
              });
              billingCycleResetEvents.push(
                ...adminMembers.map((member) => ({
                  name: "Billing cycle reset" as const,
                  userId: member.user.id,
                  workspaceId: workspace.id,
                })),
              );
              continue;
            } catch (error) {
              console.error(
                `Failed to reset billing cycle for workspace ${workspace.id}, quarantining...`,
                error,
              );
              await sendBillingCycleResetFailedEmail({
                to: adminEmails,
                workspaceName: workspace.name,
                totalChatsUsed,
              });
              await prisma.workspace.updateMany({
                where: { id: workspace.id },
                data: { isQuarantined: true },
              });
              quarantineEvents.push(
                ...adminMembers.map((member) => ({
                  name: "Workspace automatically quarantined" as const,
                  userId: member.user.id,
                  workspaceId: workspace.id,
                  data: {
                    reason:
                      "suspicious billing cycle reset payment failed" as const,
                  },
                })),
              );
            }
          }
        }
      }
    }

    if (
      (totalChatsUsed > chatsLimit * 1.5 && workspace.plan === Plan.FREE) ||
      (isDefined(workspace.chatsHardLimit) &&
        totalChatsUsed >= workspace.chatsHardLimit)
    ) {
      console.log(`Automatically quarantine workspace ${workspace.id}...`);
      await prisma.workspace.updateMany({
        where: { id: workspace.id },
        data: { isQuarantined: true },
      });
      quarantineEvents.push(
        ...workspace.members
          .filter((member) => member.role === WorkspaceRole.ADMIN)
          .map((member) => ({
            name: "Workspace automatically quarantined" as const,
            userId: member.user.id,
            workspaceId: workspace.id,
            data: {
              totalChatsUsed,
              chatsLimit: workspace.chatsHardLimit ?? chatsLimit,
              reason: "free limit reached" as const,
            },
          })),
      );
    }
  }

  await prisma.workspace.updateMany({
    where: {
      id: {
        in: workspaces.map((w) => w.id),
      },
    },
    data: {
      lastActivityAt: new Date(),
      inactiveFirstEmailSentAt: null,
      inactiveSecondEmailSentAt: null,
    },
  });

  await trackEvents(
    limitWarningEmailEvents
      .concat(quarantineEvents)
      .concat(autoUpgradeEvents)
      .concat(billingCycleResetEvents),
  );
};

const getSubscription = async (
  workspace: Pick<Workspace, "stripeId" | "plan">,
  { stripe }: { stripe: Stripe },
) => {
  if (
    !workspace.stripeId ||
    (workspace.plan !== "STARTER" && workspace.plan !== "PRO")
  )
    return;
  const subscriptions = await stripe.subscriptions.list({
    customer: workspace.stripeId,
  });

  const currentSubscription = subscriptions.data
    .filter((sub) => ["past_due", "active"].includes(sub.status))
    .sort((a, b) => a.created - b.created)
    .shift();

  return currentSubscription;
};

const reportUsageToStripe = async (
  totalResultsLastHour: number,
  {
    stripe,
    subscription,
  }: { stripe: Stripe; subscription: Stripe.Subscription },
) => {
  if (!env.STRIPE_STARTER_CHATS_PRICE_ID || !env.STRIPE_PRO_CHATS_PRICE_ID)
    throw new Error(
      "Missing STRIPE_STARTER_CHATS_PRICE_ID or STRIPE_PRO_CHATS_PRICE_ID env variable",
    );
  const subscriptionItem = subscription.items.data.find(
    (item) =>
      item.price.id === env.STRIPE_STARTER_CHATS_PRICE_ID ||
      item.price.id === env.STRIPE_PRO_CHATS_PRICE_ID,
  );

  if (!subscriptionItem)
    throw new Error(`Could not find subscription item for workspace`);

  const idempotencyKey = createId();

  return stripe.subscriptionItems.createUsageRecord(
    subscriptionItem.id,
    {
      quantity: totalResultsLastHour,
      timestamp: "now",
    },
    {
      idempotencyKey,
    },
  );
};

const getUsage = async ({
  workspaceId,
  subscription,
}: {
  workspaceId: string;
  subscription: Stripe.Subscription | undefined;
}) => {
  const typebots = await prisma.typebot.findMany({
    where: {
      workspaceId,
    },
    select: {
      id: true,
    },
  });

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalChatsUsed = await prisma.result.count({
    where: {
      typebotId: { in: typebots.map((typebot) => typebot.id) },
      hasStarted: true,
      createdAt: {
        gte: subscription
          ? new Date(subscription.current_period_start * 1000)
          : firstDayOfMonth,
      },
    },
  });

  return {
    totalChatsUsed,
  };
};

const autoUpgradeToPro = async (
  subscription: Stripe.Subscription,
  { stripe, workspaceId }: { stripe: Stripe; workspaceId: string },
): Promise<
  | { status: "success"; newSubscription: Stripe.Subscription }
  | { status: "error"; reason: "payment_required" | "unknown" }
> => {
  if (
    !env.STRIPE_STARTER_CHATS_PRICE_ID ||
    !env.STRIPE_PRO_CHATS_PRICE_ID ||
    !env.STRIPE_PRO_PRICE_ID ||
    !env.STRIPE_STARTER_PRICE_ID
  )
    throw new Error(
      "Missing STRIPE_STARTER_CHATS_PRICE_ID or STRIPE_PRO_CHATS_PRICE_ID env variable",
    );
  const currentPlanItemId = subscription?.items.data.find((item) =>
    [env.STRIPE_PRO_PRICE_ID, env.STRIPE_STARTER_PRICE_ID].includes(
      item.price.id,
    ),
  )?.id;

  if (!currentPlanItemId)
    throw new Error(`Could not find current plan item ID for workspace`);

  const newSubscription = await stripe.subscriptions.update(subscription.id, {
    items: [
      {
        id: currentPlanItemId,
        price: env.STRIPE_PRO_PRICE_ID,
        quantity: 1,
      },
      {
        id: subscription.items.data.find(
          (item) =>
            item.price.id === env.STRIPE_STARTER_CHATS_PRICE_ID ||
            item.price.id === env.STRIPE_PRO_CHATS_PRICE_ID,
        )?.id,
        price: env.STRIPE_PRO_CHATS_PRICE_ID,
      },
    ],
    proration_behavior: "always_invoice",
    metadata: {
      reason: "auto upgrade",
    },
  });

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { plan: "PRO" },
  });

  if (newSubscription.status === "past_due")
    return { status: "error", reason: "payment_required" };

  return { status: "success", newSubscription };
};

async function sendLimitWarningEmails({
  chatsLimit,
  totalChatsUsed,
  workspace,
}: {
  chatsLimit: number;
  totalChatsUsed: number;
  workspace: Pick<
    Workspace,
    | "id"
    | "name"
    | "chatsLimitFirstEmailSentAt"
    | "chatsLimitSecondEmailSentAt"
    | "plan"
    | "chatsHardLimit"
  > & {
    members: (Pick<Prisma.MemberInWorkspace, "role"> & {
      user: { id: string; email: string | null };
    })[];
  };
}): Promise<TelemetryEvent[]> {
  const limit = workspace.chatsHardLimit ?? chatsLimit;
  if (limit <= 0 || totalChatsUsed < limit * LIMIT_EMAIL_TRIGGER_PERCENT)
    return [];

  const emailEvents: TelemetryEvent[] = [];
  const adminMembers = workspace.members.filter(
    (member) => member.role === WorkspaceRole.ADMIN,
  );
  const to = adminMembers.map((member) => member.user.email).filter(isDefined);
  if (!workspace.chatsLimitFirstEmailSentAt) {
    console.log(`Send almost reached chats limit email to ${to.join(", ")}...`);
    try {
      await sendAlmostReachedChatsLimitEmail({
        to,
        usagePercent: Math.round((totalChatsUsed / limit) * 100),
        chatsLimit: limit,
        workspaceName: workspace.name,
      });
      emailEvents.push(
        ...adminMembers.map((m) => ({
          name: "Limit warning email sent" as const,
          userId: m.user.id,
          workspaceId: workspace.id,
        })),
      );
      await prisma.workspace.updateMany({
        where: { id: workspace.id },
        data: { chatsLimitFirstEmailSentAt: new Date() },
      });
    } catch (err) {
      console.error(err);
    }
  }

  if (
    totalChatsUsed >= limit &&
    !workspace.chatsLimitSecondEmailSentAt &&
    (workspace.plan === Plan.FREE || isDefined(workspace.chatsHardLimit))
  ) {
    console.log(`Send reached chats limit email to ${to.join(", ")}...`);
    try {
      await sendReachedChatsLimitEmail({
        to,
        chatsLimit: limit,
        url: `${env.NEXTAUTH_URL}/typebots?workspaceId=${workspace.id}`,
      });
      emailEvents.push(
        ...adminMembers.map((m) => ({
          name: "Limit reached email sent" as const,
          userId: m.user.id,
          workspaceId: workspace.id,
        })),
      );
      await prisma.workspace.updateMany({
        where: { id: workspace.id },
        data: { chatsLimitSecondEmailSentAt: new Date() },
      });
    } catch (err) {
      console.error(err);
    }
  }

  return emailEvents;
}

export const getLastHourActiveTypebotIds = async () => {
  const zeroedMinutesHour = new Date();
  zeroedMinutesHour.setUTCMinutes(0, 0, 0);
  const hourAgo = new Date(zeroedMinutesHour.getTime() - 1000 * 60 * 60);
  const todayMidnight = new Date();
  todayMidnight.setUTCHours(0, 0, 0, 0);

  const activePublicTypebots = await prisma.publicTypebot.findMany({
    where: {
      lastActivityAt: {
        gte: todayMidnight,
      },
    },
    select: {
      typebotId: true,
    },
  });
  console.log(
    "Found",
    activePublicTypebots.length,
    "active public typebots today",
  );

  const results = await prisma.result.findMany({
    where: {
      typebotId: {
        in: activePublicTypebots.map(
          (publicTypebot) => publicTypebot.typebotId,
        ),
      },
      isArchived: false,
      hasStarted: true,
      createdAt: {
        lt: zeroedMinutesHour,
        gte: hourAgo,
      },
    },
    select: {
      typebotId: true,
    },
    distinct: ["typebotId"],
  });

  return results.map((r) => r.typebotId);
};

const isSuspiciousWorkspace = async (
  subscription: Stripe.Subscription,
  totalChatsUsed: number,
  plan: "STARTER" | "PRO",
  { stripe }: { stripe: Stripe },
) => {
  if (plan !== "PRO" || !env.STRIPE_PRO_CHATS_PRICE_ID) return false;

  const proLimit = chatsLimits[Plan.PRO];
  if (totalChatsUsed < proLimit) return false;

  const daysSincePeriodStart = Math.max(
    (Date.now() / 1000 - subscription.current_period_start) / 86400,
    1,
  );
  const dailyAverage = totalChatsUsed / daysSincePeriodStart;
  const expectedDailyRate = proLimit / 30;

  if (dailyAverage <= expectedDailyRate * 3) return false;

  const invoices = await stripe.invoices.list({
    subscription: subscription.id,
    status: "paid",
    limit: 12,
    expand: ["data.lines"],
  });

  const { totalPaidOverageCents, paidInvoiceWithOverageCount } =
    invoices.data.reduce(
      (acc, invoice) => {
        const overageLines = invoice.lines.data.filter(
          (line) =>
            line.price?.id === env.STRIPE_PRO_CHATS_PRICE_ID && line.amount > 0,
        );
        const overageAmount = overageLines.reduce(
          (sum, line) => sum + line.amount,
          0,
        );
        return {
          totalPaidOverageCents: acc.totalPaidOverageCents + overageAmount,
          paidInvoiceWithOverageCount:
            acc.paidInvoiceWithOverageCount + (overageLines.length > 0 ? 1 : 0),
        };
      },
      { totalPaidOverageCents: 0, paidInvoiceWithOverageCount: 0 },
    );

  // Multiple invoices with overage payments establishes a payment pattern
  if (paidInvoiceWithOverageCount >= 2) return false;

  const currentOverageValueCents = computeProPlanChatsCost(totalChatsUsed);

  // Trust if they've historically paid at least 30% of equivalent current overage
  if (
    totalPaidOverageCents > 0 &&
    totalPaidOverageCents >= currentOverageValueCents * 0.3
  ) {
    return false;
  }

  // Trust if subscription is at least 2 months old with at least one paid overage
  const cycleLength = 30 * 24 * 60 * 60;
  const monthsActive = (Date.now() / 1000 - subscription.created) / cycleLength;
  if (monthsActive >= 2 && paidInvoiceWithOverageCount >= 1) return false;

  return true;
};

const chargeAndResetBillingCycle = async (
  subscription: Stripe.Subscription,
  { stripe }: { stripe: Stripe },
) =>
  stripe.subscriptions.update(subscription.id, {
    billing_cycle_anchor: "now",
    proration_behavior: "create_prorations",
    payment_behavior: "error_if_incomplete",
  });

const computeProPlanChatsCost = (totalChatsUsed: number): number => {
  for (const tier of proChatTiers) {
    if (tier.up_to === "inf") {
      const previousTierLimit =
        proChatTiers[proChatTiers.indexOf(tier) - 1]?.up_to;
      if (typeof previousTierLimit !== "number") return 0;
      const chatsInThisTier = totalChatsUsed - previousTierLimit;
      const unitAmount =
        "unit_amount_decimal" in tier ? tier.unit_amount_decimal : 0;
      return chatsInThisTier * Number(unitAmount);
    }
    if (totalChatsUsed <= tier.up_to) {
      return "flat_amount" in tier ? tier.flat_amount : 0;
    }
  }
  return 0;
};
