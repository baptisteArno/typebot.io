import { ORPCError } from "@orpc/server";
import {
  type SessionState,
  sessionStateSchema,
} from "@typebot.io/chat-session/schemas";
import { env } from "@typebot.io/env";
import { verifyWebhookToken } from "@typebot.io/lib/verifyWebhookToken";
import prisma from "@typebot.io/prisma";

export const consumeWebhookResponse = async (
  token: string | undefined,
  state: SessionState,
  sessionId: string | undefined,
) => {
  const claims = await verifyWebhookToken(token, env.WEBHOOK_RELAY_SECRET);
  const pending = state.pendingWebhook;
  if (
    !sessionId ||
    !pending ||
    !claims ||
    claims.purpose !== "response" ||
    claims.room !== pending.room ||
    claims.blockId !== state.currentBlockId ||
    claims.blockId !== pending.blockId ||
    claims.nonce !== pending.nonce ||
    pending.expiresAt <= Date.now() ||
    claims.payload === undefined
  )
    throw new ORPCError("BAD_REQUEST", { message: "Invalid webhook response" });

  // Claim this wait before running downstream effects. Compare the persisted JSON
  // atomically so concurrent continuations cannot consume the same response.
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    select: { state: true },
  });
  const persistedState = sessionStateSchema.safeParse(session?.state);
  if (
    !session?.state ||
    !persistedState.success ||
    persistedState.data.pendingWebhook?.nonce !== pending.nonce ||
    persistedState.data.currentBlockId !== pending.blockId
  )
    throw new ORPCError("BAD_REQUEST", {
      message: "Webhook response already consumed",
    });
  const claimed = await prisma.chatSession.updateMany({
    where: { id: sessionId, state: { equals: session.state } },
    data: { state: { ...persistedState.data, pendingWebhook: undefined } },
  });
  if (claimed.count !== 1)
    throw new ORPCError("BAD_REQUEST", {
      message: "Webhook response already consumed",
    });
  return claims.payload;
};
