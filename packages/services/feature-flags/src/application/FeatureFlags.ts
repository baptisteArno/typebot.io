import type { UserId } from "@typebot.io/shared-core/domain";
import { type Effect, ServiceMap } from "effect";

export class FeatureFlags extends ServiceMap.Service<
  FeatureFlags,
  {
    readonly isEnabled: (
      key: string,
      context: { userId: UserId },
    ) => Effect.Effect<boolean>;
  }
>()("@typebot.io/feature-flags/FeatureFlags") {}
