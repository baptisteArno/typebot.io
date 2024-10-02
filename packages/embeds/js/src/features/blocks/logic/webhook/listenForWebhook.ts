import { env } from "@typebot.io/env";
import PartySocket from "partysocket";

type Props = {
  resultId?: string;
  sessionId: string;
};

export const listenForWebhook = ({ sessionId, resultId }: Props) => {
  if (!env.NEXT_PUBLIC_PARTYKIT_HOST) return;
  const ws = new PartySocket({
    host: env.NEXT_PUBLIC_PARTYKIT_HOST!,
    room: getRoomName({ sessionId, resultId }),
  });
  return new Promise<{ replyToSend: string | undefined }>((resolve) => {
    ws.addEventListener("message", (event) => {
      ws.close();
      resolve({ replyToSend: event.data });
    });
  });
};

const getRoomName = ({ sessionId, resultId }: Props) => {
  if (resultId) return `${resultId}/webhooks`;
  const [typebotId, userId] = sessionId.split("-");
  return `${userId}/${typebotId}/webhooks`;
};
