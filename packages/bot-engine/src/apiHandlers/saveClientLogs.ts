import { TRPCError } from "@trpc/server";
import { formatLogDetails } from "../logs/helpers/formatLogDetails";
import { getSession } from "../queries/getSession";
import { saveLogs } from "../queries/saveLogs";
import type { ChatLog } from "../schemas/api";

type Props = {
  sessionId: string;
  clientLogs: ChatLog[];
};

export const saveClientLogs = async ({ sessionId, clientLogs }: Props) => {
  const session = await getSession(sessionId);

  if (!session) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Session not found.",
    });
  }

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
        details: formatLogDetails(log.details),
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
