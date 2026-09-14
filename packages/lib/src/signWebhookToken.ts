export type WebhookToken = {
  purpose: "subscribe" | "publish" | "response";
  room: string;
  blockId: string;
  nonce: string;
  expiresAt: number;
  payload?: string;
};

export const signWebhookToken = async (
  claims: WebhookToken,
  secret: string | undefined,
) => {
  if (!secret || secret.length < 32)
    throw new Error("WEBHOOK_RELAY_SECRET must contain at least 32 characters");
  const content = new TextEncoder().encode(JSON.stringify(claims));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, content),
  );
  return `${encode(content)}.${encode(signature)}`;
};

const encode = (bytes: Uint8Array) => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
};
