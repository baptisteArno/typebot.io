import { publicProcedure } from "@/helpers/server/trpc";
import { saveClientLogs as saveClientLogsFn } from "@typebot.io/bot-engine/apiHandlers/saveClientLogs";
import { safeStringify } from "@typebot.io/lib/safeStringify";
import { logInSessionSchema } from "@typebot.io/logs/schemas";
import { z } from "@typebot.io/zod";

export const saveClientLogsV1 = publicProcedure
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
      clientLogs: z.array(
        logInSessionSchema
          .omit({ details: true })
          .extend({ details: z.unknown().optional() }),
      ),
    }),
  )
  .output(z.object({ message: z.string() }))
  .mutation(
    ({
      input: { sessionId, clientLogs },
      ctx: { origin, iframeReferrerOrigin },
    }) => {
      const parsedLogs = clientLogs.map((log) => ({
        ...log,
        details: log.details
          ? (safeStringify(log.details) ?? undefined)
          : undefined,
      }));
      return saveClientLogsFn({
        sessionId,
        clientLogs: parsedLogs,
        origin,
        iframeReferrerOrigin,
      });
    },
  );
