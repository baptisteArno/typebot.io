import type { WebhookToken } from "./signWebhookToken";

export const verifyWebhookToken = async (
  token: string | null | undefined,
  secret: string | undefined,
): Promise<WebhookToken | undefined> => {
  if (!token || !secret || secret.length < 32) return;
  try {
    const [content, signature, extra] = token.split(".");
    if (!content || !signature || extra !== undefined) return;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const bytes = decode(content);
    if (!(await crypto.subtle.verify("HMAC", key, decode(signature), bytes)))
      return;
    const claims: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (isWebhookToken(claims) && claims.expiresAt > Date.now()) return claims;
  } catch {
    return;
  }
};

const decode = (value: string) =>
  Uint8Array.from(
    atob(value.replaceAll("-", "+").replaceAll("_", "/")),
    (char) => char.charCodeAt(0),
  );

const isWebhookToken = (value: unknown): value is WebhookToken =>
  typeof value === "object" &&
  value !== null &&
  "purpose" in value &&
  ["subscribe", "publish", "response"].some(
    (purpose) => purpose === value.purpose,
  ) &&
  "room" in value &&
  typeof value.room === "string" &&
  "blockId" in value &&
  typeof value.blockId === "string" &&
  "nonce" in value &&
  typeof value.nonce === "string" &&
  "expiresAt" in value &&
  typeof value.expiresAt === "number" &&
  Number.isFinite(value.expiresAt) &&
  (!("waitNonce" in value) || typeof value.waitNonce === "string") &&
  (!("payload" in value) || typeof value.payload === "string");
