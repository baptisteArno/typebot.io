import { guessApiHost } from "@/utils/guessApiHost";
import { isNotEmpty } from "@typebot.io/lib/utils";
import type { LogInSession } from "@typebot.io/logs/schemas";
import ky from "ky";

export const saveClientLogsQuery = async ({
  apiHost,
  sessionId,
  clientLogs,
}: {
  apiHost?: string;
  sessionId: string;
  clientLogs: LogInSession[];
}) => {
  try {
    await ky.post(
      `${
        isNotEmpty(apiHost) ? apiHost : guessApiHost()
      }/api/v2/sessions/${sessionId}/clientLogs`,
      {
        json: {
          clientLogs,
        },
      },
    );
  } catch (e) {
    console.log(e);
  }
};
