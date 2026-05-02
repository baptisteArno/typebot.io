import { env } from "@typebot.io/env";
import { Ratelimit } from "@upstash/ratelimit";
import Redis from "ioredis";

type Unit = "ms" | "s" | "m" | "h" | "d";
type Duration = `${number} ${Unit}` | `${number}${Unit}`;

type RateLimitConfig = {
  requests: number;
  window: Duration;
  prefix?: string;
};

export const createRateLimiter = (config: RateLimitConfig) => {
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
    redis: rateLimitCompatibleRedis as any,
    limiter: Ratelimit.slidingWindow(config.requests, config.window),
    prefix: config.prefix,
  });
};

declare const window: { startPreviewRateLimiter: Ratelimit | undefined };

const windowAny = globalThis as any;

if (!windowAny.startPreviewRateLimiter && env.REDIS_URL) {
  windowAny.startPreviewRateLimiter = createRateLimiter({
    requests: 20,
    window: "1 m",
    prefix: "start-preview-ratelimit",
  });
}

export const startPreviewRateLimiter = windowAny.startPreviewRateLimiter as Ratelimit | undefined;
