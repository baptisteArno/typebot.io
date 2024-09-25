import { authenticatedProcedure } from "@/helpers/server/trpc";
import { getSubscription as getSubscriptionHandler } from "@typebot.io/billing/api/getSubscription";
import { subscriptionSchema } from "@typebot.io/billing/schemas/subscription";
import { z } from "@typebot.io/zod";

export const getSubscription = authenticatedProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/billing/subscription",
      protect: true,
      summary: "List invoices",
      tags: ["Billing"],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
    }),
  )
  .output(
    z.object({
      subscription: subscriptionSchema.or(z.null().openapi({ type: "string" })),
    }),
  )
  .query(async ({ input: { workspaceId }, ctx: { user } }) =>
    getSubscriptionHandler({ workspaceId, user }),
  );
