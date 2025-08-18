import { getIframeReferrerOrigin } from "@/utils/getIframeReferrerOrigin";
import { guessApiHost } from "@/utils/guessApiHost";
import type {
  ContinueChatResponse,
  Message,
} from "@typebot.io/chat-api/schemas";
import { isNotEmpty } from "@typebot.io/lib/utils";
import ky from "ky";

export const continueChatQuery = async ({
  apiHost,
  message,
  sessionId,
}: {
  apiHost?: string;
  message?: Message;
  sessionId: string;
}) => {
  try {
    const iframeReferrerOrigin = getIframeReferrerOrigin();
    const data = await ky
      .post(
        `${
          isNotEmpty(apiHost) ? apiHost : guessApiHost()
        }/api/v1/sessions/${sessionId}/continueChat`,
        {
          headers: {
            "x-typebot-iframe-referrer-origin": iframeReferrerOrigin,
          },
          json: {
            message,
          },
          timeout: false,
        },
      )
      .json<ContinueChatResponse>();

    return { data };
  } catch (error) {
    return { error };
  }
};
