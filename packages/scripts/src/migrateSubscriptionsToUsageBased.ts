import { writeFileSync } from "fs";
import { createId } from "@paralleldrive/cuid2";
import prisma from "@typebot.io/prisma";
import { Stripe } from "stripe";
import { promptAndSetEnvironment } from "./utils";

const migrateSubscriptionsToUsageBased = async () => {
  await promptAndSetEnvironment();

  if (
    !process.env.STRIPE_STARTER_CHATS_PRICE_ID ||
    !process.env.STRIPE_PRO_CHATS_PRICE_ID ||
    !process.env.STRIPE_SECRET_KEY ||
    !process.env.STRIPE_STARTER_PRICE_ID ||
    !process.env.STRIPE_PRO_PRICE_ID
  )
    throw new Error("Missing some env variables");

  const {
    starterChatsPriceId,
    proChatsPriceId,
    secretKey,
    starterPriceId,
    proPriceId,
    starterYearlyPriceId,
    proYearlyPriceId,
  } = {
    starterChatsPriceId: process.env.STRIPE_STARTER_CHATS_PRICE_ID,
    proChatsPriceId: process.env.STRIPE_PRO_CHATS_PRICE_ID,
    secretKey: process.env.STRIPE_SECRET_KEY,
    starterPriceId: process.env.STRIPE_STARTER_PRICE_ID,
    proPriceId: process.env.STRIPE_PRO_PRICE_ID,
    starterYearlyPriceId: process.env.STRIPE_STARTER_YEARLY_PRICE_ID,
    proYearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  };

  const workspacesWithPaidPlan = await prisma.workspace.findMany({
    where: {
      plan: {
        in: ["PRO", "STARTER"],
      },
      isSuspended: false,
    },
    select: {
      plan: true,
      name: true,
      id: true,
      stripeId: true,
      isQuarantined: true,
      members: {
        select: {
          user: {
            select: { email: true },
          },
        },
      },
    },
  });

  writeFileSync(
    "./workspacesWithPaidPlan.json",
    JSON.stringify(workspacesWithPaidPlan, null, 2),
  );

  const stripe = new Stripe(secretKey, {
    apiVersion: "2022-11-15",
  });

  const todayMidnight = new Date();
  todayMidnight.setUTCHours(0, 0, 0, 0);

  const failedWorkspaces = [];
  const workspacesWithoutSubscription = [];
  const workspacesWithoutStripeId = [];

  let i = 0;
  for (const workspace of workspacesWithPaidPlan) {
    i += 1;
    console.log(
      `(${i} / ${workspacesWithPaidPlan.length})`,
      "Migrating workspace:",
      workspace.id,
      workspace.name,
      workspace.stripeId,
      JSON.stringify(workspace.members.map((member) => member.user.email)),
    );
    if (!workspace.stripeId) {
      console.log("No stripe ID, skipping...");
      workspacesWithoutStripeId.push(workspace);
      writeFileSync(
        "./workspacesWithoutStripeId.json",
        JSON.stringify(workspacesWithoutStripeId, null, 2),
      );
      continue;
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: workspace.stripeId,
    });

    const currentSubscription = subscriptions.data
      .filter((sub) => ["past_due", "active"].includes(sub.status))
      .sort((a, b) => a.created - b.created)
      .shift();

    if (!currentSubscription) {
      console.log("No current subscription in workspace:", workspace.id);
      workspacesWithoutSubscription.push(workspace);
      writeFileSync(
        "./workspacesWithoutSubscription.json",
        JSON.stringify(workspacesWithoutSubscription),
      );
      continue;
    }

    if (
      currentSubscription.items.data.find(
        (item) =>
          item.price.id === starterChatsPriceId ||
          item.price.id === proChatsPriceId,
      )
    ) {
      console.log(
        "Already migrated to usage based billing for workspace. Skipping...",
      );
      continue;
    }
    if (
      !currentSubscription.items.data.find(
        (item) =>
          item.price.id === starterPriceId ||
          item.price.id === proPriceId ||
          item.price.id === starterYearlyPriceId ||
          item.price.id === proYearlyPriceId,
      )
    ) {
      console.log(
        "Could not find STARTER or PRO plan in items for workspace:",
        workspace.id,
      );
      failedWorkspaces.push(workspace);
      writeFileSync(
        "./failedWorkspaces.json",
        JSON.stringify(failedWorkspaces, null, 2),
      );
      continue;
    }

    const newSubscription = await stripe.subscriptions.update(
      currentSubscription.id,
      {
        items: [
          ...currentSubscription.items.data.flatMap<Stripe.SubscriptionUpdateParams.Item>(
            (item) => {
              if (
                item.price.id === starterPriceId ||
                item.price.id === proPriceId
              )
                return {
                  id: item.id,
                  price: item.price.id,
                  quantity: item.quantity,
                };
              if (
                item.price.id === starterYearlyPriceId ||
                item.price.id === proYearlyPriceId
              )
                return [
                  {
                    id: item.id,
                    price: item.price.id,
                    quantity: item.quantity,
                    deleted: true,
                  },
                  {
                    price:
                      workspace.plan === "STARTER"
                        ? starterPriceId
                        : proPriceId,
                    quantity: 1,
                  },
                ];
              return {
                id: item.id,
                price: item.price.id,
                quantity: item.quantity,
                deleted: true,
              };
            },
          ),
          {
            price:
              workspace.plan === "STARTER"
                ? starterChatsPriceId
                : proChatsPriceId,
          },
        ],
      },
    );

    const totalResults = await prisma.result.count({
      where: {
        typebot: { workspaceId: workspace.id },
        hasStarted: true,
        createdAt: {
          gte: new Date(newSubscription.current_period_start * 1000),
          lt: todayMidnight,
        },
      },
    });

    if (workspace.plan === "STARTER" && totalResults >= 4000) {
      console.log(
        "Workspace has more than 4000 chats, automatically upgrading to PRO plan",
      );
      const currentPlanItemId = newSubscription?.items.data.find((item) =>
        [starterPriceId, proPriceId].includes(item.price.id),
      )?.id;

      if (!currentPlanItemId)
        throw new Error(`Could not find current plan item ID for workspace`);

      await stripe.subscriptions.update(newSubscription.id, {
        items: [
          {
            id: currentPlanItemId,
            price: proPriceId,
            quantity: 1,
          },
          {
            id: newSubscription.items.data.find(
              (item) =>
                item.price.id === starterChatsPriceId ||
                item.price.id === proChatsPriceId,
            )?.id,
            price: proChatsPriceId,
          },
        ],
      });

      await prisma.workspace.update({
        where: { id: workspace.id },
        data: {
          plan: "PRO",
        },
      });
    }

    const subscriptionItem = newSubscription.items.data.find(
      (item) =>
        item.price.id === starterChatsPriceId ||
        item.price.id === proChatsPriceId,
    );

    if (!subscriptionItem)
      throw new Error(
        `Could not find subscription item for workspace ${workspace.id}`,
      );

    const idempotencyKey = createId();

    console.log("Reporting total results:", totalResults);
    await stripe.subscriptionItems.createUsageRecord(
      subscriptionItem.id,
      {
        quantity: totalResults,
        timestamp: "now",
      },
      {
        idempotencyKey,
      },
    );

    if (workspace.isQuarantined) {
      await prisma.workspace.update({
        where: { id: workspace.id },
        data: {
          isQuarantined: false,
        },
      });
    }
  }
};

migrateSubscriptionsToUsageBased();
