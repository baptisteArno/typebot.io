import { ORPCError } from "@orpc/server";
import { getSession } from "@typebot.io/chat-session/queries/getSession";
import { logInSessionSchema } from "@typebot.io/logs/schemas";
import { z } from "@typebot.io/zod";
import { assertOriginIsAllowed } from "../helpers/assertOriginIsAllowed";
import { shortenLogDetails } from "../logs/helpers/shortenLogDetails";
import { saveLogs } from "../queries/saveLogs";

export const saveClientLogsInputSchema = z.object({
  sessionId: z.string(),
  clientLogs: z.array(logInSessionSchema),
});

type Context = {
  origin?: string;
  iframeReferrerOrigin?: string;
};

export const handleSaveClientLogs = async ({
  input: { sessionId, clientLogs },
  context: { origin, iframeReferrerOrigin },
}: {
  input: z.infer<typeof saveClientLogsInputSchema>;
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

  try {
    await saveLogs(
      clientLogs.map((log) => ({
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
