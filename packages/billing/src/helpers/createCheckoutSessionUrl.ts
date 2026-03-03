import { env } from "@typebot.io/env";
import type Stripe from "stripe";

type Props = {
  email: string;
  workspaceId: string;
  plan: "STARTER" | "PRO";
  returnUrl: string;
  userId: string;
};

export const createCheckoutSessionUrl =
  (stripe: Stripe) => async (input: Props) => {
    const { workspaceId, plan, returnUrl, email } = input;
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
      tax_id_collection: {
        enabled: true,
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
