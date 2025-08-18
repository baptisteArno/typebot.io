import { getIframeReferrerOrigin } from "@/utils/getIframeReferrerOrigin";
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
    const iframeReferrerOrigin = getIframeReferrerOrigin();
    await ky.post(
      `${
        isNotEmpty(apiHost) ? apiHost : guessApiHost()
      }/api/v2/sessions/${sessionId}/clientLogs`,
      {
        headers: {
          "x-typebot-iframe-referrer-origin": iframeReferrerOrigin,
        },
        json: {
          clientLogs,
        },
      },
    );
  } catch (e) {
    console.log(e);
  }
};
