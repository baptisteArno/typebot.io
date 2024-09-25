import { authenticatedProcedure } from "@/helpers/server/trpc";
import { updateSubscription as updateSubscriptionHandler } from "@typebot.io/billing/api/updateSubscription";
import { Plan } from "@typebot.io/prisma/enum";
import { workspaceSchema } from "@typebot.io/workspaces/schemas";
import { z } from "@typebot.io/zod";

export const updateSubscription = authenticatedProcedure
  .meta({
    openapi: {
      method: "PATCH",
      path: "/v1/billing/subscription",
      protect: true,
      summary: "Update subscription",
      tags: ["Billing"],
    },
  })
  .input(
    z.object({
      returnUrl: z.string(),
      workspaceId: z.string(),
      plan: z.enum([Plan.STARTER, Plan.PRO]),
      currency: z.enum(["usd", "eur"]),
    }),
  )
  .output(
    z.object({
      workspace: workspaceSchema.nullish(),
      checkoutUrl: z.string().nullish(),
    }),
  )
  .mutation(async ({ input, ctx: { user } }) =>
    updateSubscriptionHandler({
      ...input,
      user,
    }),
  );
