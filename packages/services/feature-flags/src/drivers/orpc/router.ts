import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { Effect, Schema } from "effect";
import type { FeatureFlags } from "../../application/FeatureFlags";
import { PostHogFeatureFlagsLayer } from "../../infrastructure/PostHogFeatureFlags";
import { handleIsEnabled, IsEnabledInputSchema } from "./handleIsEnabled";

const runFeatureFlagsEffectHandler = <A, E>(
  handler: Effect.Effect<A, E, FeatureFlags>,
) => Effect.runPromise(handler.pipe(Effect.provide(PostHogFeatureFlagsLayer)));

export const featureFlagsRouter = {
  isEnabled: authenticatedProcedure
    .input(IsEnabledInputSchema.pipe(Schema.toStandardSchemaV1))
    .handler((props) => runFeatureFlagsEffectHandler(handleIsEnabled(props))),
};
