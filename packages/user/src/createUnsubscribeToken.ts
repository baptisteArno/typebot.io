import { createHmac } from "node:crypto";
import { env } from "@typebot.io/env";
import { normalizeEmail } from "./normalizeEmail";

export const createUnsubscribeToken = (email: string) => {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  if (!env.EMAIL_UNSUBSCRIBE_SECRET) return null;
  return createHmac("sha256", env.EMAIL_UNSUBSCRIBE_SECRET)
    .update(normalized)
    .digest("base64url");
};
