import { decrypt } from "@typebot.io/credentials/decrypt";
import { z } from "zod";

const decryptedSecretSchema = z.object({ value: z.string() });

export const decryptSecretValue = async (
  encryptedData: string,
  iv: string,
): Promise<string> => {
  const parsed = decryptedSecretSchema.parse(await decrypt(encryptedData, iv));
  return parsed.value;
};
