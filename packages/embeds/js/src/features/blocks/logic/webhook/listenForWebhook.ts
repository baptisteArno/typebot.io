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
  // PartySocket reconnects automatically. Keep the action pending until data
  // arrives so a transient close cannot remove the persisted signed wait.
  return new Promise<{ replyToSend: string }>((resolve) => {
    ws.addEventListener("message", (event) => {
      ws.close();
      resolve({ replyToSend: event.data });
    });
  });
};
