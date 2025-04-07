import { env } from "@typebot.io/env";
import { Ratelimit } from "@upstash/ratelimit";
import Redis from "ioredis";

export const createRateLimiter = () => {
  if (!env.REDIS_URL) return;

  const redis = new Redis(env.REDIS_URL);

  const rateLimitCompatibleRedis = {
    sadd: <TData>(key: string, ...members: TData[]) =>
      redis.sadd(key, ...members.map((m) => String(m))),
    eval: async <TArgs extends unknown[], TData = unknown>(
      script: string,
      keys: string[],
      args: TArgs,
    ) =>
      redis.eval(
        script,
        keys.length,
        ...keys,
        ...(args ?? []).map((a) => String(a)),
      ) as Promise<TData>,
  };

  return new Ratelimit({
    redis: rateLimitCompatibleRedis,
    limiter: Ratelimit.slidingWindow(1, "60 s"),
  });
};
