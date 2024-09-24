import { env } from "@typebot.io/env";

const algorithm = "AES-GCM";
const secretKey = env.ENCRYPTION_SECRET;

export const decryptV2 = async (
  encryptedData: string,
  ivHex: string,
): Promise<object> => {
  if (!secretKey) throw new Error("ENCRYPTION_SECRET is not in environment");
  const iv = new Uint8Array(
    ivHex.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? [],
  );

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secretKey),
    algorithm,
    false,
    ["decrypt"],
  );

  const encryptedBuffer = new Uint8Array(
    Array.from(atob(encryptedData)).map((char) => char.charCodeAt(0)),
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: algorithm, iv },
    key,
    encryptedBuffer,
  );

  const decryptedData = new TextDecoder().decode(decryptedBuffer);
  return JSON.parse(decryptedData);
};
