import { createHmac, timingSafeEqual } from "node:crypto";

const signaturePrefix = "sha256=";
const sha256HexDigestLength = 64;

export const verifyWhatsAppWebhookSignature = ({
  appSecret,
  rawBody,
  signature,
}: {
  appSecret: string;
  rawBody: string;
  signature: string | undefined;
}) => {
  if (!signature?.startsWith(signaturePrefix)) return false;

  const receivedSignatureDigest = signature.slice(signaturePrefix.length);
  if (!isSha256HexDigest(receivedSignatureDigest)) return false;

  const receivedSignature = Buffer.from(receivedSignatureDigest, "hex");
  const expectedSignature = createHmac("sha256", appSecret)
    .update(rawBody, "utf8")
    .digest();

  if (receivedSignature.length !== expectedSignature.length) return false;

  return timingSafeEqual(receivedSignature, expectedSignature);
};

const isSha256HexDigest = (value: string) =>
  value.length === sha256HexDigestLength && /^[\da-f]+$/i.test(value);
