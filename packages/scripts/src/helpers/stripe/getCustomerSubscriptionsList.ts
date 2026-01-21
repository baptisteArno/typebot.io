import { env } from "@typebot.io/env";
import Stripe from "stripe";
import { countryToFlagEmoji } from "./countryToFlagEmoji";
import { getCurrentBillingCountry } from "./getCurrentBillingCountry";
import { getTotalPaidForSubscription } from "./getTotalPaidForSubscription";

export type CustomerSubscriptionSummary = {
  subscriptionId: string;
  countryEmoji: string;
  startDate: string;
  status: Stripe.Subscription.Status;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  cancellationReason: string;
  cancellationComment: string;
  totalPaid: string;
};

export const getCustomerSubscriptionsList = async (stripeId: string) => {
  if (!env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  const activeSubscriptions = await stripe.subscriptions.list({
    customer: stripeId,
  });
  const canceledSubscriptions = await stripe.subscriptions.list({
    customer: stripeId,
    status: "canceled",
  });
  const subscriptions = activeSubscriptions.data.concat(
    canceledSubscriptions.data,
  );

  const countryEmoji =
    countryToFlagEmoji(await getCurrentBillingCountry(stripeId)) ?? "";
  const subscriptionsList: CustomerSubscriptionSummary[] = [];
  for (const sub of subscriptions) {
    subscriptionsList.push({
      subscriptionId: sub.id,
      countryEmoji,
      startDate: new Date(sub.start_date * 1000).toISOString().split("T")[0],
      status: sub.status,
      currentPeriodEnd: sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString().split("T")[0]
        : "N/A",
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      canceledAt: sub.canceled_at
        ? new Date(sub.canceled_at * 1000).toISOString().split("T")[0]
        : null,
      cancellationReason: sub.cancellation_details?.feedback || "N/A",
      cancellationComment: sub.cancellation_details?.comment || "N/A",
      totalPaid: await getTotalPaidForSubscription(sub.id),
    });
  }
  return subscriptionsList;
};
