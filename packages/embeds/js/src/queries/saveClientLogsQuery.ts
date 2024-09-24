import { guessApiHost } from "@/utils/guessApiHost";
import type { ChatLog } from "@typebot.io/bot-engine/schemas/api";
import { isNotEmpty } from "@typebot.io/lib/utils";
import ky from "ky";

export const saveClientLogsQuery = async ({
  apiHost,
  sessionId,
  clientLogs,
}: {
  apiHost?: string;
  sessionId: string;
  clientLogs: ChatLog[];
}) => {
  try {
    await ky.post(
      `${
        isNotEmpty(apiHost) ? apiHost : guessApiHost()
      }/api/v1/sessions/${sessionId}/clientLogs`,
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
