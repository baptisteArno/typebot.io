import type { WebhookBlock } from "@typebot.io/blocks-logic/webhook/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { env } from "@typebot.io/env";
import { signWebhookToken } from "@typebot.io/lib/signWebhookToken";
import type { ExecuteLogicResponse } from "../../../types";

export const executeWebhookBlock = async (
  block: WebhookBlock,
  state: SessionState,
): Promise<ExecuteLogicResponse> => {
  const pendingWebhook = {
    room: state.typebotsQueue[0].resultId
      ? `${state.typebotsQueue[0].resultId}/webhooks`
      : (state.webhookRoom ?? `unroutable/${crypto.randomUUID()}`),
    blockId: block.id,
    nonce: crypto.randomUUID(),
    expiresAt: Date.now() + (state.expiryTimeout ?? 24 * 60 * 60 * 1000),
  };
  return {
    newSessionState: { ...state, pendingWebhook },
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions: [
      {
        type: "listenForWebhook",
        room: pendingWebhook.room,
        token: await signWebhookToken(
          { ...pendingWebhook, purpose: "subscribe" },
          env.WEBHOOK_RELAY_SECRET,
        ),
        expectsDedicatedReply: true,
      },
    ],
  };
};
