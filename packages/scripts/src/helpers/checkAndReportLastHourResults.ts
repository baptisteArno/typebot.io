import { createId } from "@paralleldrive/cuid2";
import { getChatsLimit } from "@typebot.io/billing/helpers/getChatsLimit";
import { sendAlmostReachedChatsLimitEmail } from "@typebot.io/emails/transactional/AlmostReachedChatsLimitEmail";
import { sendReachedChatsLimitEmail } from "@typebot.io/emails/transactional/ReachedChatsLimitEmail";
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

  const results = await getLastHourResults();

  console.log(
    `Found ${results.reduce(
      (total, result) => total + result._count._all,
      0,
    )} results collected for the last hour.`,
  );

  const workspaces = await prisma.workspace.findMany({
    where: {
      typebots: {
        some: {
          id: { in: results.map((result) => result.typebotId) },
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

  if (isEmpty(process.env.STRIPE_SECRET_KEY))
    throw new Error("Missing STRIPE_SECRET_KEY env variable");

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-09-30.acacia",
  });

  const limitWarningEmailEvents: TelemetryEvent[] = [];
  const quarantineEvents: TelemetryEvent[] = [];
  const autoUpgradeEvents: TelemetryEvent[] = [];

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
          item.price.id === process.env.STRIPE_STARTER_PRICE_ID ||
          item.price.id === process.env.STRIPE_PRO_PRICE_ID,
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
              .map(
                (member) =>
                  ({
                    name: "Subscription automatically updated",
                    userId: member.user.id,
                    workspaceId: workspace.id,
                    data: {
                      plan: "PRO",
                    },
                  }) satisfies TelemetryEvent,
              ),
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
              .map(
                (member) =>
                  ({
                    name: "Workspace automatically quarantined",
                    userId: member.user.id,
                    workspaceId: workspace.id,
                    data: {
                      reason: "auto upgrade payment failed",
                    },
                  }) satisfies TelemetryEvent,
              ),
          );
        }
      } else {
        await reportUsageToStripe(totalChatsUsed, { stripe, subscription });
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
          .map(
            (member) =>
              ({
                name: "Workspace automatically quarantined",
                userId: member.user.id,
                workspaceId: workspace.id,
                data: {
                  totalChatsUsed,
                  chatsLimit: workspace.chatsHardLimit ?? chatsLimit,
                  reason: "free limit reached",
                },
              }) satisfies TelemetryEvent,
          ),
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

  console.log(
    `Send ${limitWarningEmailEvents.length}, new results events and ${quarantineEvents.length} auto quarantine events...`,
  );

  await trackEvents(limitWarningEmailEvents.concat(quarantineEvents));
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
  if (
    !process.env.STRIPE_STARTER_CHATS_PRICE_ID ||
    !process.env.STRIPE_PRO_CHATS_PRICE_ID
  )
    throw new Error(
      "Missing STRIPE_STARTER_CHATS_PRICE_ID or STRIPE_PRO_CHATS_PRICE_ID env variable",
    );
  const subscriptionItem = subscription.items.data.find(
    (item) =>
      item.price.id === process.env.STRIPE_STARTER_CHATS_PRICE_ID ||
      item.price.id === process.env.STRIPE_PRO_CHATS_PRICE_ID,
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
    !process.env.STRIPE_STARTER_CHATS_PRICE_ID ||
    !process.env.STRIPE_PRO_CHATS_PRICE_ID ||
    !process.env.STRIPE_PRO_PRICE_ID ||
    !process.env.STRIPE_STARTER_PRICE_ID
  )
    throw new Error(
      "Missing STRIPE_STARTER_CHATS_PRICE_ID or STRIPE_PRO_CHATS_PRICE_ID env variable",
    );
  const currentPlanItemId = subscription?.items.data.find((item) =>
    [
      process.env.STRIPE_PRO_PRICE_ID,
      process.env.STRIPE_STARTER_PRICE_ID,
    ].includes(item.price.id),
  )?.id;

  if (!currentPlanItemId)
    throw new Error(`Could not find current plan item ID for workspace`);

  const newSubscription = await stripe.subscriptions.update(subscription.id, {
    items: [
      {
        id: currentPlanItemId,
        price: process.env.STRIPE_PRO_PRICE_ID,
        quantity: 1,
      },
      {
        id: subscription.items.data.find(
          (item) =>
            item.price.id === process.env.STRIPE_STARTER_CHATS_PRICE_ID ||
            item.price.id === process.env.STRIPE_PRO_CHATS_PRICE_ID,
        )?.id,
        price: process.env.STRIPE_PRO_CHATS_PRICE_ID,
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
        ...adminMembers.map(
          (m) =>
            ({
              name: "Limit warning email sent",
              userId: m.user.id,
              workspaceId: workspace.id,
            }) satisfies TelemetryEvent,
        ),
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
        url: `${process.env.NEXTAUTH_URL}/typebots?workspaceId=${workspace.id}`,
      });
      emailEvents.push(
        ...adminMembers.map(
          (m) =>
            ({
              name: "Limit reached email sent",
              userId: m.user.id,
              workspaceId: workspace.id,
            }) satisfies TelemetryEvent,
        ),
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

export const getLastHourResults = async () => {
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

  const queryParams = {
    by: ["typebotId"],
    _count: {
      _all: true,
    },
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
  } satisfies Prisma.Prisma.ResultGroupByArgs;

  return prisma.result.groupBy(queryParams);
};
