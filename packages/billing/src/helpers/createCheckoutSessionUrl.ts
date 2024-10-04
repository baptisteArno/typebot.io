import { env } from "@typebot.io/env";
import type Stripe from "stripe";

type Props = {
  email: string;
  workspaceId: string;
  currency: "usd" | "eur";
  plan: "STARTER" | "PRO";
  returnUrl: string;
};

export const createCheckoutSessionUrl =
  (stripe: Stripe) =>
  async ({ email, workspaceId, currency, plan, returnUrl }: Props) => {
    const session = await stripe.checkout.sessions.create({
      success_url: `${returnUrl}?stripe=${plan}&success=true`,
      cancel_url: `${returnUrl}?stripe=cancel`,
      allow_promotion_codes: true,
      customer_email: email,
      mode: "subscription",
      metadata: {
        workspaceId,
        plan,
      },
      currency,
      billing_address_collection: "required",
      tax_id_collection: {
        enabled: true,
        required: "if_supported",
      },
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
