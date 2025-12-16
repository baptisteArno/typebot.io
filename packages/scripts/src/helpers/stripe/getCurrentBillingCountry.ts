import { env } from "@typebot.io/env";
import Stripe from "stripe";

export async function getCurrentBillingCountry(customerId: string) {
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
