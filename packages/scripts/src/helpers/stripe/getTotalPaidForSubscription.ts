import { env } from "@typebot.io/env";
import Stripe from "stripe";

export const getTotalPaidForSubscription = async (
  subscriptionId: string,
): Promise<string> => {
  if (!env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  let total = 0;
  let hasMore = true;
  let startingAfter: string | undefined;

  let currency = "USD";
  while (hasMore) {
    const invoices = await stripe.invoices.list({
      subscription: subscriptionId,
      limit: 100,
      starting_after: startingAfter,
    });

    for (const invoice of invoices.data) {
      if (invoice.status === "paid") {
        total += invoice.amount_paid ?? 0;
        currency = invoice.currency;
      }
    }

    hasMore = invoices.has_more;
    if (hasMore) startingAfter = invoices.data[invoices.data.length - 1].id;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(total / 100);
};
