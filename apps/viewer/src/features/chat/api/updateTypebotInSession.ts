import { publicProcedure } from "@/helpers/server/trpc";
import { updateTypebotInSession as updateTypebotInSessionFn } from "@typebot.io/bot-engine/apiHandlers/updateTypebotInSession";
import { z } from "@typebot.io/zod";

export const updateTypebotInSession = publicProcedure
  .meta({
    openapi: {
      method: "POST",
      path: "/v1/sessions/{sessionId}/updateTypebot",
      summary: "Update typebot in session",
      description:
        "Update chat session with latest typebot modifications. This is useful when you want to update the typebot in an ongoing session after making changes to it.",
      protect: true,
    },
  })
  .input(
    z.object({
      sessionId: z.string(),
    }),
  )
  .output(z.object({ message: z.literal("success") }))
  .mutation(({ input: { sessionId }, ctx: { user } }) =>
    updateTypebotInSessionFn({ user, sessionId }),
  );
