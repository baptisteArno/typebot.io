import { env } from "@typebot.io/env";
import type { Ratelimit } from "@upstash/ratelimit";
import { createRateLimiter } from "../helpers/createRateLimiter";

declare const global: { rateLimiter: Ratelimit | undefined };

if (!global.rateLimiter && env.REDIS_URL) {
  global.rateLimiter = createRateLimiter();
}

export default global.rateLimiter;
