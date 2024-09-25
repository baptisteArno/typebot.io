import { createId } from "@paralleldrive/cuid2";
import { getChatsLimit } from "@typebot.io/billing/helpers/getChatsLimit";
import { sendAlmostReachedChatsLimitEmail } from "@typebot.io/emails/emails/AlmostReachedChatsLimitEmail";
import { isDefined, isEmpty } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { Plan, WorkspaceRole } from "@typebot.io/prisma/enum";
import type { TelemetryEvent } from "@typebot.io/telemetry/schemas";
import { trackEvents } from "@typebot.io/telemetry/trackEvents";
import type { Workspace } from "@typebot.io/workspaces/schemas";
import Stripe from "stripe";
import { promptAndSetEnvironment } from "./utils";

const LIMIT_EMAIL_TRIGGER_PERCENT = 0.75;

export const checkAndReportChatsUsage = async () => {
  await promptAndSetEnvironment("production");

  console.log("Get collected results from the last hour...");

  const zeroedMinutesHour = new Date();
  zeroedMinutesHour.setUTCMinutes(0, 0, 0);
  const hourAgo = new Date(zeroedMinutesHour.getTime() - 1000 * 60 * 60);

  const results = await prisma.result.groupBy({
    by: ["typebotId"],
    _count: {
      _all: true,
    },
    where: {
      hasStarted: true,
      createdAt: {
        lt: zeroedMinutesHour,
        gte: hourAgo,
      },
    },
  });

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
    },
  });

  if (isEmpty(process.env.STRIPE_SECRET_KEY))
    throw new Error("Missing STRIPE_SECRET_KEY env variable");

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-11-15",
  });

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
    if (
      chatsLimit > 0 &&
      totalChatsUsed >= chatsLimit * LIMIT_EMAIL_TRIGGER_PERCENT &&
      totalChatsUsed < chatsLimit &&
      !workspace.chatsLimitFirstEmailSentAt
    ) {
      const to = workspace.members
        .filter((member) => member.role === WorkspaceRole.ADMIN)
        .map((member) => member.user.email)
        .filter(isDefined);
      console.log(
        `Send almost reached chats limit email to ${to.join(", ")}...`,
      );
      try {
        await sendAlmostReachedChatsLimitEmail({
          to,
          usagePercent: Math.round((totalChatsUsed / chatsLimit) * 100),
          chatsLimit,
          workspaceName: workspace.name,
        });
        await prisma.workspace.updateMany({
          where: { id: workspace.id },
          data: { chatsLimitFirstEmailSentAt: new Date() },
        });
      } catch (err) {
        console.error(err);
      }
    }

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
        const newSubscription = await autoUpgradeToPro(subscription, {
          stripe,
          workspaceId: workspace.id,
        });
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
          subscription: newSubscription,
        });
      } else {
        await reportUsageToStripe(totalChatsUsed, { stripe, subscription });
      }
    }

    if (totalChatsUsed > chatsLimit * 1.5 && workspace.plan === Plan.FREE) {
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
                  chatsLimit,
                },
              }) satisfies TelemetryEvent,
          ),
      );
    }
  }

  const resultsWithWorkspaces = results
    .flatMap((result) => {
      const workspace = workspaces.find((workspace) =>
        workspace.typebots.some((typebot) => typebot.id === result.typebotId),
      );
      if (!workspace) return;
      return workspace.members
        .filter((member) => member.role !== WorkspaceRole.GUEST)
        .map((member, memberIndex) => ({
          userId: member.user.id,
          workspace: workspace,
          typebotId: result.typebotId,
          totalResultsLastHour: result._count._all,
          isFirstOfKind: memberIndex === 0 ? (true as const) : undefined,
        }));
    })
    .filter(isDefined);

  const newResultsCollectedEvents = resultsWithWorkspaces.map(
    (result) =>
      ({
        name: "New results collected",
        userId: result.userId,
        workspaceId: result.workspace.id,
        typebotId: result.typebotId,
        data: {
          total: result.totalResultsLastHour,
          isFirstOfKind: result.isFirstOfKind,
        },
      }) satisfies TelemetryEvent,
  );

  console.log(
    `Send ${newResultsCollectedEvents.length} new results events and ${quarantineEvents.length} auto quarantine events...`,
  );

  await trackEvents(quarantineEvents.concat(newResultsCollectedEvents));
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
) => {
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

  const newSubscription = stripe.subscriptions.update(subscription.id, {
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

  return newSubscription;
};

checkAndReportChatsUsage().then();
