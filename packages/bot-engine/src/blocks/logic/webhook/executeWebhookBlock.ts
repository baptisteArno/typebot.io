import type { WebhookBlock } from "@typebot.io/blocks-logic/webhook/schema";
import type { ExecuteLogicResponse } from "../../../types";

export const executeWebhookBlock = (
  block: WebhookBlock,
): ExecuteLogicResponse => ({
  outgoingEdgeId: block.outgoingEdgeId,
  clientSideActions: [
    {
      type: "listenForWebhook",
      expectsDedicatedReply: true,
    },
  ],
});
