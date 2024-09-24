import { authenticatedProcedure } from "@/helpers/server/trpc";
import { getUsage as getUsageHandler } from "@typebot.io/billing/api/getUsage";
import { z } from "@typebot.io/zod";

export const getUsage = authenticatedProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/billing/usage",
      protect: true,
      summary: "Get current plan usage",
      tags: ["Billing"],
    },
  })
  .input(
    z.object({
      workspaceId: z
        .string()
        .describe(
          "[Where to find my workspace ID?](../how-to#how-to-find-my-workspaceid)",
        ),
    }),
  )
  .output(z.object({ totalChatsUsed: z.number(), resetsAt: z.date() }))
  .query(async ({ input: { workspaceId }, ctx: { user } }) =>
    getUsageHandler({ workspaceId, user }),
  );
