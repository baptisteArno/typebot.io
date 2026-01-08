import { env } from "@typebot.io/env";
import Stripe from "stripe";
import { countryToFlagEmoji } from "../helpers/stripe/countryToFlagEmoji";
import { getCurrentBillingCountry } from "../helpers/stripe/getCurrentBillingCountry";
import { getTotalPaidForSubscription } from "../helpers/stripe/getTotalPaidForSubscription";

export const getSubscriptionCancellationDetails = async (
  customerId: string,
): Promise<{
  status: string;
  countryEmoji?: string;
  feedback?: string;
  comment?: string;
  totalPaid: string;
  cancelAt: Date | undefined;
} | null> => {
  if (!env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 10,
  });

  const subscriptionScheduledForCancellation = subscriptions.data.find(
    (sub) => sub.cancel_at,
  );

  if (!subscriptionScheduledForCancellation) return null;

  return {
    status: subscriptionScheduledForCancellation.status,
    countryEmoji: countryToFlagEmoji(
      await getCurrentBillingCountry(customerId),
    ),
    totalPaid: await getTotalPaidForSubscription(
      subscriptionScheduledForCancellation.id,
    ),
    feedback:
      subscriptionScheduledForCancellation.cancellation_details?.feedback ??
      undefined,
    comment:
      subscriptionScheduledForCancellation.cancellation_details?.comment ??
      undefined,
    cancelAt: subscriptionScheduledForCancellation.cancel_at
      ? new Date(subscriptionScheduledForCancellation.cancel_at * 1000)
      : undefined,
  };
};
