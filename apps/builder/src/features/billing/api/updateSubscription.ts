import { updateSubscription as updateSubscriptionHandler } from "@typebot.io/billing/api/updateSubscription";
import { Plan } from "@typebot.io/prisma/enum";
import { workspaceSchema } from "@typebot.io/workspaces/schemas";
import { z } from "@typebot.io/zod";
import { authenticatedProcedure } from "@/helpers/server/trpc";

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
    }),
  )
  .output(
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal("success"),
        workspace: workspaceSchema,
      }),
      z.object({
        type: z.literal("error"),
        title: z.string(),
        description: z.string().nullish(),
      }),
      z.object({
        type: z.literal("checkoutUrl"),
        checkoutUrl: z.string(),
      }),
    ]),
  )
  .mutation(async ({ input, ctx: { user } }) =>
    updateSubscriptionHandler({
      ...input,
      user,
    }),
  );
