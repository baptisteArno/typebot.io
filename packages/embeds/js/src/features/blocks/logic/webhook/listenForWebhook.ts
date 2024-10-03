import type { ChatLog } from "@typebot.io/bot-engine/schemas/api";
import { getRuntimeVariable } from "@typebot.io/env/getRuntimeVariable";
import PartySocket from "partysocket";

type Props = {
  resultId?: string;
  sessionId: string;
};

export const listenForWebhook = ({ sessionId, resultId }: Props) => {
  const host = getRuntimeVariable("NEXT_PUBLIC_PARTYKIT_HOST");
  if (!host) return;

  const ws = new PartySocket({
    host,
    room: getRoomName({ sessionId, resultId }),
  });
  return new Promise<{ replyToSend: string | undefined; logs?: ChatLog[] }>(
    (resolve) => {
      ws.addEventListener("message", (event) => {
        ws.close();
        resolve({ replyToSend: event.data });
      });

      ws.addEventListener("error", (error) => {
        resolve({
          logs: [
            {
              status: "error",
              description: "Websocket returned an error",
              details: JSON.stringify(error, null, 2),
            },
          ],
          replyToSend: undefined,
        });
      });
    },
  );
};

const getRoomName = ({ sessionId, resultId }: Props) => {
  if (resultId) return `${resultId}/webhooks`;
  const [typebotId, userId] = sessionId.split("-");
  return `${userId}/${typebotId}/webhooks`;
};
