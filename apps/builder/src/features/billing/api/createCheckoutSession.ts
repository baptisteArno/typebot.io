import { authenticatedProcedure } from "@/helpers/server/trpc";
import { createCheckoutSession as createCheckoutSessionHandler } from "@typebot.io/billing/api/createCheckoutSession";
import { Plan } from "@typebot.io/prisma/enum";
import { z } from "@typebot.io/zod";

export const createCheckoutSession = authenticatedProcedure
  .meta({
    openapi: {
      method: "POST",
      path: "/v1/billing/subscription/checkout",
      protect: true,
      summary: "Create checkout session to create a new subscription",
      tags: ["Billing"],
    },
  })
  .input(
    z.object({
      email: z.string(),
      company: z.string(),
      workspaceId: z.string(),
      currency: z.enum(["usd", "eur"]),
      plan: z.enum([Plan.STARTER, Plan.PRO]),
      returnUrl: z.string(),
      vat: z
        .object({
          type: z.string(),
          value: z.string(),
        })
        .optional(),
    }),
  )
  .output(
    z.object({
      checkoutUrl: z.string(),
    }),
  )
  .mutation(async ({ input, ctx: { user } }) =>
    createCheckoutSessionHandler({ ...input, user }),
  );
