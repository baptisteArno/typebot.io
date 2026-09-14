import { ORPCError } from "@orpc/server";
import { env } from "@typebot.io/env";
import { signWebhookToken } from "@typebot.io/lib/signWebhookToken";
import PartySocket from "partysocket";
import { serializeWebhookResponse } from "./serializeWebhookResponse";

export const publishWebhook = async (
  room: string,
  blockId: string,
  body: unknown,
  waitNonce?: string,
) => {
  if (!env.NEXT_PUBLIC_PARTYKIT_HOST)
    throw new ORPCError("NOT_FOUND", { message: "PartyKit not configured" });
  const response = await PartySocket.fetch(
    { host: env.NEXT_PUBLIC_PARTYKIT_HOST, room: encodeURIComponent(room) },
    {
      method: "POST",
      body: await signWebhookToken(
        {
          purpose: "publish",
          room,
          blockId,
          waitNonce,
          nonce: crypto.randomUUID(),
          expiresAt: Date.now() + 60_000,
          payload: serializeWebhookResponse(body),
        },
        env.WEBHOOK_RELAY_SECRET,
      ),
    },
  );
  if (!response.ok)
    throw new ORPCError("BAD_GATEWAY", {
      message: "Webhook relay rejected the publication",
    });
};
