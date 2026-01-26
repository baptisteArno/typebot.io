import { timingSafeEqual } from "node:crypto";
import { createUnsubscribeToken } from "./createUnsubscribeToken";

export const verifyUnsubscribeToken = (email: string, token: string) => {
  const expected = createUnsubscribeToken(email);
  if (!expected) return false;
  if (expected.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
};
