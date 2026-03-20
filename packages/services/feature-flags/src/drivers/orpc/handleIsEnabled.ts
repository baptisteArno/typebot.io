import { ORPCError } from "@orpc/server";
import type { UserInOrpcContext } from "@typebot.io/config/orpc/builder/context";
import { Effect, Schema } from "effect";
import { FeatureFlags } from "../../application/FeatureFlags";

export const IsEnabledInputSchema = Schema.Struct({
  key: Schema.String,
});

export type IsEnabledInput = typeof IsEnabledInputSchema.Type;

export const handleIsEnabled = Effect.fn("handleIsEnabled")(
  function* ({
    input,
    context: { user },
  }: {
    input: IsEnabledInput;
    context: { user: UserInOrpcContext };
  }) {
    const featureFlags = yield* FeatureFlags;
    const enabled = yield* featureFlags.isEnabled(input.key, {
      userId: user.id,
    });
    return { enabled };
  },
  Effect.catchDefect((defect) =>
    Effect.fail(
      new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to evaluate feature flag",
        cause: defect,
      }),
    ),
  ),
);
