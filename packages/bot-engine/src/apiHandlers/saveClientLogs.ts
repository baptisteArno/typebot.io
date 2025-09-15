import { TRPCError } from "@trpc/server";
import { getSession } from "@typebot.io/chat-session/queries/getSession";
import type { LogInSession } from "@typebot.io/logs/schemas";
import { assertOriginIsAllowed } from "../helpers/assertOriginIsAllowed";
import { shortenLogDetails } from "../logs/helpers/shortenLogDetails";
import { saveLogs } from "../queries/saveLogs";

type Props = {
  origin: string | undefined;
  iframeReferrerOrigin: string | undefined;
  sessionId: string;
  clientLogs: LogInSession[];
};

export const saveClientLogs = async ({
  origin,
  iframeReferrerOrigin,
  sessionId,
  clientLogs,
}: Props) => {
  const session = await getSession(sessionId);

  if (!session?.state) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Session not found.",
    });
  }

  assertOriginIsAllowed(origin, {
    allowedOrigins: session.state.allowedOrigins,
    iframeReferrerOrigin,
  });

  const resultId = session.state.typebotsQueue[0].resultId;

  if (!resultId) {
    throw new TRPCError({
      code: "NOT_FOUND",
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
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to save logs.",
    });
  }
};
