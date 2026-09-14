import { ORPCError } from "@orpc/server";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { env } from "@typebot.io/env";
import { signWebhookToken } from "@typebot.io/lib/signWebhookToken";
import { serializeWebhookResponse } from "./serializeWebhookResponse";

export const signWhatsAppWebhookResponse = async (
  state: SessionState,
  body: unknown,
) => {
  if (!state.pendingWebhook || state.pendingWebhook.expiresAt <= Date.now())
    throw new ORPCError("BAD_REQUEST", {
      message: "No active webhook wait. Restart the session.",
    });
  return signWebhookToken(
    {
      ...state.pendingWebhook,
      purpose: "response",
      payload: serializeWebhookResponse(body),
    },
    env.WEBHOOK_RELAY_SECRET,
  );
};
