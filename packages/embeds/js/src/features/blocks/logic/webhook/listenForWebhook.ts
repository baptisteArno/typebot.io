import type { LogInSession } from "@typebot.io/logs/schemas";
import PartySocket from "partysocket";
import type { ClientSideActionContext } from "../../../../types";
import { getPartyKitHost } from "../../../../utils/getPartyKitHost";

type Props = {
  room: string;
  token: string;
  context: ClientSideActionContext;
};

export const listenForWebhook = ({ room, token, context }: Props) => {
  const ws = new PartySocket({
    host: getPartyKitHost(context.wsHost),
    room: encodeURIComponent(room),
    query: { token },
  });
  return new Promise<{
    replyToSend: string | undefined;
    logs?: LogInSession[];
  }>((resolve) => {
    ws.addEventListener("message", (event) => {
      ws.close();
      resolve({ replyToSend: event.data });
    });

    const fail = () => {
      ws.close();
      resolve({
        logs: [
          {
            status: "error",
            description: "Websocket returned an error",
          },
        ],
        replyToSend: undefined,
      });
    };
    ws.addEventListener("error", fail);
    ws.addEventListener("close", fail);
  });
};
