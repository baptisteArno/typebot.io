import { getSubscriptionPreview as getSubscriptionPreviewHandler } from "@typebot.io/billing/api/getSubscriptionPreview";
import { Plan } from "@typebot.io/prisma/enum";
import { z } from "@typebot.io/zod";
import { authenticatedProcedure } from "@/helpers/server/trpc";

export const getSubscriptionPreview = authenticatedProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/billing/subscription/preview",
      protect: true,
      summary: "Get subscription upgrade preview",
      tags: ["Billing"],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
      plan: z.enum([Plan.STARTER, Plan.PRO]),
    }),
  )
  .output(
    z.object({
      amountDue: z.number(),
      currency: z.enum(["usd", "eur"]),
    }),
  )
  .query(async ({ input, ctx: { user } }) =>
    getSubscriptionPreviewHandler({
      ...input,
      user,
    }),
  );
