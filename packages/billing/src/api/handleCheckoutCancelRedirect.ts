import { ORPCError } from "@orpc/server";
import { env } from "@typebot.io/env";
import type { User } from "@typebot.io/user/schemas";
import Stripe from "stripe";
import { z } from "zod";

export const cancelCheckoutSessionInputSchema = z.object({
  customerId: z.string(),
  returnUrl: z.string(),
});

export const handleCheckoutCancelRedirect = async ({
  input: { returnUrl, customerId },
  context: { user },
}: {
  input: z.infer<typeof cancelCheckoutSessionInputSchema>;
  context: { user: Pick<User, "email"> };
}) => {
  if (!env.STRIPE_SECRET_KEY)
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Stripe environment variables are missing",
    });
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  const redirectResponse = {
    headers: {
      location: returnUrl,
    },
  };

  const customer = await stripe.customers.retrieve(customerId);

  if (
    customer.deleted ||
    customer.email !== user.email ||
    (customer.subscriptions?.data.length ?? 0) > 0
  )
    return redirectResponse;

  const deletedCustomer = await stripe.customers.del(customerId);

  if (!deletedCustomer.deleted)
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Failed to delete customer",
    });

  return redirectResponse;
};
