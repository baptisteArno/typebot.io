import { saveClientLogs as saveClientLogsFn } from "@typebot.io/bot-engine/apiHandlers/saveClientLogs";
import { logInSessionSchema } from "@typebot.io/logs/schemas";
import { z } from "@typebot.io/zod";
import { publicProcedure } from "@/helpers/server/trpc";

export const saveClientLogs = publicProcedure
  .meta({
    openapi: {
      method: "POST",
      path: "/v2/sessions/{sessionId}/clientLogs",
      summary: "Save logs",
    },
  })
  .input(
    z.object({
      sessionId: z.string(),
      clientLogs: z.array(logInSessionSchema),
    }),
  )
  .output(z.object({ message: z.string() }))
  .mutation(
    ({
      input: { sessionId, clientLogs },
      ctx: { origin, iframeReferrerOrigin },
    }) =>
      saveClientLogsFn({ sessionId, clientLogs, origin, iframeReferrerOrigin }),
  );
