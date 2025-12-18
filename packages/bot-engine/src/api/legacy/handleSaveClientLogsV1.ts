import { ORPCError } from "@orpc/server";
import { getSession } from "@typebot.io/chat-session/queries/getSession";
import { safeStringify } from "@typebot.io/lib/safeStringify";
import { logInSessionSchema } from "@typebot.io/logs/schemas";
import { z } from "@typebot.io/zod";
import { assertOriginIsAllowed } from "../../helpers/assertOriginIsAllowed";
import { shortenLogDetails } from "../../logs/helpers/shortenLogDetails";
import { saveLogs } from "../../queries/saveLogs";

export const saveClientLogsV1InputSchema = z.object({
  sessionId: z.string(),
  clientLogs: z.array(
    logInSessionSchema
      .omit({ details: true })
      .extend({ details: z.unknown().optional() }),
  ),
});

type Context = {
  origin?: string;
  iframeReferrerOrigin?: string;
};

export const handleSaveClientLogsV1 = async ({
  input: { sessionId, clientLogs },
  context: { origin, iframeReferrerOrigin },
}: {
  input: z.infer<typeof saveClientLogsV1InputSchema>;
  context: Context;
}) => {
  const session = await getSession(sessionId);

  if (!session?.state) {
    throw new ORPCError("NOT_FOUND", {
      message: "Session not found.",
    });
  }

  assertOriginIsAllowed(origin, {
    allowedOrigins: session.state.allowedOrigins,
    iframeReferrerOrigin,
  });

  const resultId = session.state.typebotsQueue[0].resultId;

  if (!resultId) {
    throw new ORPCError("NOT_FOUND", {
      message: "Result not found.",
    });
  }

  const parsedLogs = clientLogs.map((log) => ({
    ...log,
    details: log.details
      ? (safeStringify(log.details) ?? undefined)
      : undefined,
  }));

  try {
    await saveLogs(
      parsedLogs.map((log) => ({
        ...log,
        resultId,
        details: shortenLogDetails(log.details),
      })),
    );
    return {
      message: "Logs successfully saved.",
    };
  } catch (e) {
    console.error("Failed to save logs", e);
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Failed to save logs.",
    });
  }
};
