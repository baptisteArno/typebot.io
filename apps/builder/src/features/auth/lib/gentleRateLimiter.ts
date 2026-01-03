import { env } from "@typebot.io/env";
import type { Ratelimit } from "@upstash/ratelimit";
import { createRateLimiter } from "../helpers/createRateLimiter";

declare const global: { gentleRateLimiter: Ratelimit | undefined };

if (!global.gentleRateLimiter && env.REDIS_URL) {
  global.gentleRateLimiter = createRateLimiter({
    requests: 10,
    window: "60 s",
    prefix: "gentle-ratelimit",
  });
}

export default global.gentleRateLimiter;
