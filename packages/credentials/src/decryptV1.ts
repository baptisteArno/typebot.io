import { createDecipheriv } from "node:crypto";
import { env } from "@typebot.io/env";

const algorithm = "aes-256-gcm";
const secretKey = env.ENCRYPTION_SECRET;

export const decryptV1 = (encryptedData: string, auth: string): object => {
  if (!secretKey) throw new Error(`ENCRYPTION_SECRET is not in environment`);
  const [iv, tag] = auth.split(".");
  if (!iv || !tag) return {};
  const decipher = createDecipheriv(
    algorithm,
    secretKey,
    new Uint8Array(Buffer.from(iv, "hex")),
  );
  decipher.setAuthTag(new Uint8Array(Buffer.from(tag, "hex")));
  return JSON.parse(
    (
      decipher.update(new Uint8Array(Buffer.from(encryptedData, "hex"))) +
      decipher.final("hex")
    ).toString(),
  );
};
