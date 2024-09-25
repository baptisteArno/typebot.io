import prisma from "@typebot.io/prisma";
import { Stripe } from "stripe";
import { promptAndSetEnvironment } from "./utils";

const checkSubscriptionsStatus = async () => {
  await promptAndSetEnvironment();

  const workspacesWithPaidPlan = await prisma.workspace.findMany({
    where: {
      plan: {
        in: ["PRO", "STARTER", "CUSTOM"],
      },
    },
  });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2022-11-15",
  });

  let totalActiveSubscriptions = 0;
  for (const workspace of workspacesWithPaidPlan) {
    if (!workspace.stripeId) {
      console.log("No stripe ID", workspace.id);
      continue;
    }
    const customer = await stripe.customers.retrieve(workspace.stripeId);
    const subscription = (
      await stripe.subscriptions.list({
        customer: customer.id,
      })
    ).data.at(0);
    if (!subscription) {
      console.log("No subscription", workspace.id);
      continue;
    }
    if (subscription.status === "active") {
      totalActiveSubscriptions++;
      continue;
    }
    console.log(`${workspace.id} - ${workspace.name} - ${subscription.status}`);
  }
  console.log("Active subscriptions", totalActiveSubscriptions);
};

checkSubscriptionsStatus();
