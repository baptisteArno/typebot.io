import { encrypt } from "@typebot.io/credentials/encrypt";

export const encryptSecretValue = async (plaintext: string) =>
  encrypt({ value: plaintext });
