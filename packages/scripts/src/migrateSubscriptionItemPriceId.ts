import { writeFileSync } from "fs";
import prisma from "@typebot.io/prisma";
import Stripe from "stripe";
import { promptAndSetEnvironment } from "./utils";

const migrateSubscriptionItemPriceId = async () => {
  await promptAndSetEnvironment();

  if (
    !process.env.STRIPE_STARTER_CHATS_PRICE_ID_OLD ||
    !process.env.STRIPE_STARTER_CHATS_PRICE_ID ||
    !process.env.STRIPE_PRO_CHATS_PRICE_ID_OLD ||
    !process.env.STRIPE_PRO_CHATS_PRICE_ID ||
    !process.env.STRIPE_SECRET_KEY
  )
    throw new Error("Missing some env variables");

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

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-11-15",
  });

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
      continue;
    }

    const subscriptionItem = currentSubscription.items.data.find(
      (item) =>
        item.price.id === process.env.STRIPE_STARTER_CHATS_PRICE_ID_OLD ||
        item.price.id === process.env.STRIPE_PRO_CHATS_PRICE_ID_OLD,
    );

    if (!subscriptionItem) {
      console.log("Could not find subscriptio item. Skipping...");
      continue;
    }

    await stripe.subscriptionItems.update(subscriptionItem.id, {
      price:
        workspace.plan === "STARTER"
          ? process.env.STRIPE_STARTER_CHATS_PRICE_ID
          : process.env.STRIPE_PRO_CHATS_PRICE_ID,
    });
  }
};

migrateSubscriptionItemPriceId();
