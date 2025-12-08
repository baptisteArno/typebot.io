import { createActionHandler } from "@typebot.io/forge";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { isEmpty } from "@typebot.io/lib/utils";
import ky, { HTTPError } from "ky";
import { sendMessage } from "./actions/sendMessage";
import { apiBaseUrl } from "./constants";
import type { ChatNodeResponse } from "./types";

export default [
  createActionHandler(sendMessage, {
    server: async ({
      credentials: { apiKey },
      options: { botId, message, responseMapping, threadId },
      variables,
      logs,
    }) => {
      try {
        const res: ChatNodeResponse = await ky
          .post(apiBaseUrl + botId, {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
            json: {
              message,
              chat_session_id: isEmpty(threadId) ? undefined : threadId,
            },
            timeout: false,
          })
          .json();

        responseMapping?.forEach((mapping) => {
          if (!mapping.variableId) return;

          const item = mapping.item ?? "Message";
          if (item === "Message")
            variables.set([{ id: mapping.variableId, value: res.message }]);

          if (item === "Thread ID")
            variables.set([
              { id: mapping.variableId, value: res.chat_session_id },
            ]);
        });
      } catch (error) {
        if (error instanceof HTTPError)
          return logs.add(
            await parseUnknownError({
              err: error,
              context: "While sending message to ChatNode",
            }),
          );
      }
    },
  }),
];
