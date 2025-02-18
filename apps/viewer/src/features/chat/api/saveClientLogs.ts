import { publicProcedure } from "@/helpers/server/trpc";
import { saveClientLogs as saveClientLogsFn } from "@typebot.io/bot-engine/apiHandlers/saveClientLogs";
import { logInSessionSchema } from "@typebot.io/logs/schemas";
import { z } from "@typebot.io/zod";

export const saveClientLogs = publicProcedure
  .meta({
    openapi: {
      method: "POST",
      path: "/v1/sessions/{sessionId}/clientLogs",
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
  .mutation(({ input: { sessionId, clientLogs } }) =>
    saveClientLogsFn({ sessionId, clientLogs }),
  );
