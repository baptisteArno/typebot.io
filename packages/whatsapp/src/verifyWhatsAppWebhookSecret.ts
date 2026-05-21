import { timingSafeEqual } from "node:crypto";

export const verifyWhatsAppWebhookSecret = ({
  expectedSecret,
  receivedSecret,
}: {
  expectedSecret: string;
  receivedSecret: string | undefined;
}) => {
  if (!receivedSecret) return false;

  const expectedSecretBuffer = Buffer.from(expectedSecret, "utf8");
  const receivedSecretBuffer = Buffer.from(receivedSecret, "utf8");

  if (receivedSecretBuffer.length !== expectedSecretBuffer.length) return false;

  return timingSafeEqual(receivedSecretBuffer, expectedSecretBuffer);
};
