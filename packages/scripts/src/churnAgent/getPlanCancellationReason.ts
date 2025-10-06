import { env } from "@typebot.io/env";
import Stripe from "stripe";

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

const getTotalPaidForSubscription = async (
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

async function getCurrentBillingCountry(customerId: string) {
  if (!env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  const customer = await stripe.customers.retrieve(customerId, {
    expand: ["invoice_settings.default_payment_method"],
  });
  if (customer.deleted) return null;

  const fromCustomer = customer.address?.country ?? null;

  const dpm = (customer.invoice_settings?.default_payment_method ??
    null) as Stripe.PaymentMethod | null;
  const fromPM = dpm?.billing_details?.address?.country ?? null;

  const fromShipping = customer.shipping?.address?.country ?? null;

  return fromCustomer ?? fromPM ?? fromShipping;
}

function countryToFlagEmoji(countryCode?: string | null) {
  if (!countryCode) return;
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
}
