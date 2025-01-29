import { env } from "@typebot.io/env";

const algorithm = "AES-GCM";
const secretKey = env.ENCRYPTION_SECRET;

export const encrypt = async (
  data: object,
): Promise<{ encryptedData: string; iv: string }> => {
  if (!secretKey) throw new Error("ENCRYPTION_SECRET is not in environment");
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(JSON.stringify(data));

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secretKey),
    algorithm,
    false,
    ["encrypt"],
  );

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: algorithm, iv },
    key,
    encodedData,
  );

  const encryptedData = btoa(
    String.fromCharCode.apply(
      null,
      Array.from(new Uint8Array(encryptedBuffer)),
    ),
  );

  const ivHex = Array.from(iv)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return {
    encryptedData,
    iv: ivHex,
  };
};
