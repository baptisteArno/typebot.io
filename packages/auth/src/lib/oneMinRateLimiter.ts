import { env } from "@typebot.io/env";
import type { Ratelimit } from "@upstash/ratelimit";
import { createRateLimiter } from "../helpers/createRateLimiter";

declare const global: { oneMinRateLimiter: Ratelimit | undefined };

if (!global.oneMinRateLimiter && env.REDIS_URL) {
  global.oneMinRateLimiter = createRateLimiter({
    requests: 1,
    window: "60 s",
    prefix: "one-min-ratelimit",
  });
}

export default global.oneMinRateLimiter;
