import type { UserId } from "@typebot.io/shared-core/domain";
import { Config, Effect, Layer, Redacted } from "effect";
import { PostHog } from "posthog-node";
import { FeatureFlags } from "../application/FeatureFlags";

export const PostHogFeatureFlagsLayer = Layer.effect(
  FeatureFlags,
  Effect.gen(function* () {
    const apiKey = yield* Config.redacted("NEXT_PUBLIC_POSTHOG_KEY").pipe(
      Config.option,
    );
    const host = yield* Config.url("POSTHOG_API_HOST").pipe(Config.option);

    if (!apiKey.valueOrUndefined) {
      return FeatureFlags.of({
        isEnabled: Effect.fn("FeatureFlags.isEnabled")(function* (
          _key: string,
          _context: { userId: UserId },
        ) {
          return yield* Effect.succeed(true);
        }),
      });
    }

    const client = new PostHog(Redacted.value(apiKey.valueOrUndefined), {
      host: host.valueOrUndefined?.toString(),
    });

    return FeatureFlags.of({
      isEnabled: Effect.fn("FeatureFlags.isEnabled")(function* (
        key: string,
        context: { userId: UserId },
      ) {
        const enabled = yield* Effect.tryPromise({
          try: () => client.isFeatureEnabled(key, context.userId),
          catch: (cause) =>
            cause instanceof Error ? cause : new Error(String(cause)),
        }).pipe(Effect.orDie);
        return Boolean(enabled);
      }),
    });
  }),
);
