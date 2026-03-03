import { env } from "@typebot.io/env";
import type Stripe from "stripe";
import { cancelCheckoutPath } from "../api/router";

type Props = {
  customerId: string;
  workspaceId: string;
  plan: "STARTER" | "PRO";
  returnUrl: string;
  userId: string;
};

export const createCheckoutSessionUrl =
  (stripe: Stripe) =>
  async ({ customerId, workspaceId, plan, returnUrl }: Props) => {
    const returnUrlOrigin = new URL(returnUrl).origin;
    const cancelUrl = `${returnUrlOrigin}/api${cancelCheckoutPath}?returnUrl=${returnUrl}&customerId=${customerId}`;
    const session = await stripe.checkout.sessions.create({
      success_url: `${returnUrl}?stripe=${plan}&success=true`,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      customer: customerId,
      customer_update: {
        address: "auto",
        name: "never",
      },
      mode: "subscription",
      metadata: {
        workspaceId,
        plan,
      },
      billing_address_collection: "required",
      automatic_tax: { enabled: true },
      line_items: [
        {
          price:
            plan === "STARTER"
              ? env.STRIPE_STARTER_PRICE_ID
              : env.STRIPE_PRO_PRICE_ID,
          quantity: 1,
        },
        {
          price:
            plan === "STARTER"
              ? env.STRIPE_STARTER_CHATS_PRICE_ID
              : env.STRIPE_PRO_CHATS_PRICE_ID,
        },
      ],
    });

    return session.url;
  };
