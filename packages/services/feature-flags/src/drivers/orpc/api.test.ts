import { expect, it } from "@effect/vitest";
import type { UserInOrpcContext } from "@typebot.io/config/orpc/builder/context";
import { UserId } from "@typebot.io/shared-core/domain";
import { Effect, Layer } from "effect";
import { FeatureFlags } from "../../application/FeatureFlags";
import { handleIsEnabled } from "./handleIsEnabled";

const testUserId = UserId.makeUnsafe("user_test_feature_flags");

const contextUser: UserInOrpcContext = {
  id: testUserId,
  email: "flags@test.com",
  groupTitlesAutoGeneration: null,
};

const MockFeatureFlagsLayer = Layer.succeed(
  FeatureFlags,
  FeatureFlags.of({
    isEnabled: Effect.fn("MockFeatureFlags.isEnabled")(function* (
      key: string,
      context: { userId: typeof testUserId },
    ) {
      return yield* Effect.succeed(
        key === "alpha" && context.userId === testUserId,
      );
    }),
  }),
);

it.layer(MockFeatureFlagsLayer)("FeatureFlags orpc", (it) => {
  it.effect("returns enabled from mock", () =>
    Effect.gen(function* () {
      const result = yield* handleIsEnabled({
        input: { key: "alpha" },
        context: { user: contextUser },
      });
      expect(result.enabled).toBe(true);
    }),
  );

  it.effect("returns disabled when key does not match", () =>
    Effect.gen(function* () {
      const result = yield* handleIsEnabled({
        input: { key: "other" },
        context: { user: contextUser },
      });
      expect(result.enabled).toBe(false);
    }),
  );
});
