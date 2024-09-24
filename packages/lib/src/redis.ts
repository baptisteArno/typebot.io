import { env } from "@typebot.io/env";
import { Redis } from "ioredis";

declare const global: { redis: Redis | undefined };
let redis: Redis | undefined;

if (env.NODE_ENV === "production" && !process.versions.bun && env.REDIS_URL) {
  redis = new Redis(env.REDIS_URL);
} else if (env.REDIS_URL) {
  if (!global.redis) {
    global.redis = new Redis(env.REDIS_URL);
  }
  redis = global.redis;
}

export default redis;
