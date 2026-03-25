import { FeatureFlags } from "@typebot.io/feature-flags/application/FeatureFlags";
import type { UserId } from "@typebot.io/shared-core/domain";
import { WorkspaceAccessPolicies } from "@typebot.io/workspaces/application/WorkspaceAccessPolicies";
import { Effect, Layer, Schema, ServiceMap } from "effect";
import {
  ForbiddenSpaceAccessError,
  type SpaceAlreadyExistsError,
  type SpaceNotFoundError,
  SpacesFeatureDisabledError,
} from "../domain/errors";
import { Space } from "../domain/Space";
import {
  type ListSpacesInput,
  type SpaceCreateInput,
  type SpaceDeleteInput,
  type SpacePatchInput,
  SpacesRepo,
} from "./SpacesRepo";

export class SpacesUsecases extends ServiceMap.Service<
  SpacesUsecases,
  {
    readonly list: (
      input: ListSpacesInput,
      context: { userId: UserId },
    ) => Effect.Effect<
      SpaceListResponse,
      ForbiddenSpaceAccessError | SpacesFeatureDisabledError
    >;
    readonly create: (
      input: SpaceCreateInput,
      context: { userId: UserId },
    ) => Effect.Effect<
      Space,
      | SpaceAlreadyExistsError
      | SpaceNotFoundError
      | ForbiddenSpaceAccessError
      | SpacesFeatureDisabledError
    >;
    readonly patch: (
      input: SpacePatchInput,
      context: { userId: UserId },
    ) => Effect.Effect<
      Space,
      | SpaceNotFoundError
      | ForbiddenSpaceAccessError
      | SpacesFeatureDisabledError
    >;
    readonly delete: (
      input: SpaceDeleteInput,
      context: { userId: UserId },
    ) => Effect.Effect<
      void,
      | SpaceNotFoundError
      | ForbiddenSpaceAccessError
      | SpacesFeatureDisabledError
    >;
  }
>()("@typebot.io/SpacesUsecases") {
  static readonly layer = Layer.effect(
    SpacesUsecases,
    Effect.gen(function* () {
      const spacesRepo = yield* SpacesRepo;
      const workspaceAccessPolicies = yield* WorkspaceAccessPolicies;
      const featureFlags = yield* FeatureFlags;

      const assertSpacesFeatureEnabled = Effect.fn(
        "SpacesUsecases.assertSpacesFeatureEnabled",
      )(function* (userId: UserId) {
        const enabled = yield* featureFlags.isEnabled("spaces", { userId });
        if (!enabled) return yield* new SpacesFeatureDisabledError();
      });

      const list = Effect.fn("SpacesUsecases.list")(function* (
        input: ListSpacesInput,
        context: { userId: UserId },
      ) {
        yield* assertSpacesFeatureEnabled(context.userId);

        const canRead = yield* workspaceAccessPolicies.canRead(
          input.workspaceId,
          context.userId,
        );

        if (!canRead) return yield* new ForbiddenSpaceAccessError();

        const spaces = yield* spacesRepo.list(input);

        return yield* Schema.decodeUnknownEffect(SpaceListResponseSchema)(
          spaces,
        ).pipe(Effect.orDie);
      });

      const create = Effect.fn("SpacesUsecases.create")(function* (
        input: SpaceCreateInput,
        context: { userId: UserId },
      ) {
        yield* assertSpacesFeatureEnabled(context.userId);

        const canCreate = yield* workspaceAccessPolicies.canWrite(
          input.workspaceId,
          context.userId,
        );

        if (!canCreate) return yield* new ForbiddenSpaceAccessError();

        return yield* spacesRepo.create(input);
      });

      const patch = Effect.fn("SpacesUsecases.patch")(function* (
        input: SpacePatchInput,
        context: { userId: UserId },
      ) {
        yield* assertSpacesFeatureEnabled(context.userId);

        const canPatch = yield* workspaceAccessPolicies.canWrite(
          input.workspaceId,
          context.userId,
        );

        if (!canPatch) return yield* new ForbiddenSpaceAccessError();

        return yield* spacesRepo.patch(input);
      });

      const deleteSpace = Effect.fn("SpacesUsecases.delete")(function* (
        input: SpaceDeleteInput,
        context: { userId: UserId },
      ) {
        yield* assertSpacesFeatureEnabled(context.userId);

        const canDelete = yield* workspaceAccessPolicies.canWrite(
          input.workspaceId,
          context.userId,
        );

        if (!canDelete) return yield* new ForbiddenSpaceAccessError();

        yield* spacesRepo.delete(input);
      });

      return SpacesUsecases.of({
        list,
        create,
        patch,
        delete: deleteSpace,
      });
    }),
  );
}

export const SpaceListResponseSchema = Schema.Array(
  Space.mapFields(({ id, name, icon }) => ({
    id,
    name,
    icon,
  })),
);
export type SpaceListResponse = typeof SpaceListResponseSchema.Type;
