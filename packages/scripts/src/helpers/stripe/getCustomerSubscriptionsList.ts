import { env } from "@typebot.io/env";
import Stripe from "stripe";
import { countryToFlagEmoji } from "./countryToFlagEmoji";
import { getCurrentBillingCountry } from "./getCurrentBillingCountry";
import { getTotalPaidForSubscription } from "./getTotalPaidForSubscription";

export const getCustomerSubscriptionsList = async (stripeId: string) => {
  if (!env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  const active_subscriptions = await stripe.subscriptions.list({
    customer: stripeId,
  });
  const cancelled_subscriptions = await stripe.subscriptions.list({
    customer: stripeId,
    status: "canceled",
  });
  const subscriptions = active_subscriptions.data.concat(
    cancelled_subscriptions.data,
  );

  console.log(subscriptions);

  const subscriptions_list = [];
  for (const sub of subscriptions) {
    subscriptions_list.push({
      subscription_id: sub.id,
      country_emoji: countryToFlagEmoji(
        await getCurrentBillingCountry(stripeId),
      ),
      start_date: new Date(sub.start_date * 1000).toISOString().split("T")[0],
      status: sub.status,
      current_period_end: sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString().split("T")[0]
        : "N/A",
      cancel_at_period_end: sub.cancel_at_period_end,
      canceled_at: sub.canceled_at
        ? new Date(sub.canceled_at * 1000).toISOString().split("T")[0]
        : null,
      cancellation_reason: sub.cancellation_details?.feedback || "N/A",
      cancellation_comment: sub.cancellation_details?.comment || "N/A",
      total_paid: await getTotalPaidForSubscription(sub.id),
    });
  }
  return subscriptions_list;
};
