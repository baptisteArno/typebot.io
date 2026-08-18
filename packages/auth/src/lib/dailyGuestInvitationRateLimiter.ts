import { env } from "@typebot.io/env";
import type { Ratelimit } from "@upstash/ratelimit";
import { createRateLimiter } from "../helpers/createRateLimiter";

declare const global: {
  dailyGuestInvitationRateLimiter: Ratelimit | undefined;
};

if (!global.dailyGuestInvitationRateLimiter && env.REDIS_URL) {
  global.dailyGuestInvitationRateLimiter = createRateLimiter({
    requests: 100,
    window: "1 d",
    prefix: "daily-guest-invitation-ratelimit",
  });
}

export default global.dailyGuestInvitationRateLimiter;
