import { SpaceId, WorkspaceId } from "@typebot.io/shared-core/domain";
import { type Effect, Schema, ServiceMap } from "effect";
import type {
  SpaceAlreadyExistsError,
  SpaceNotFoundError,
} from "../domain/errors";
import { type Space, SpaceIcon, SpaceName } from "../domain/Space";

export class SpacesRepo extends ServiceMap.Service<
  SpacesRepo,
  {
    readonly list: (input: ListSpacesInput) => Effect.Effect<readonly Space[]>;
    readonly create: (
      input: SpaceCreateInput,
    ) => Effect.Effect<Space, SpaceAlreadyExistsError>;
    readonly patch: (
      input: SpacePatchInput,
    ) => Effect.Effect<Space, SpaceNotFoundError>;
    readonly delete: (
      input: SpaceDeleteInput,
    ) => Effect.Effect<void, SpaceNotFoundError>;
  }
>()("@typebot.io/SpacesRepo") {}

export const ListSpacesInputSchema = Schema.Struct({
  workspaceId: WorkspaceId,
});
export type ListSpacesInput = typeof ListSpacesInputSchema.Type;

export const SpaceCreateInputSchema = Schema.Struct({
  id: Schema.optional(SpaceId),
  workspaceId: WorkspaceId,
  name: SpaceName,
  icon: Schema.optional(SpaceIcon),
});
export type SpaceCreateInput = typeof SpaceCreateInputSchema.Type;

export const SpacePatchInputSchema = Schema.Struct({
  workspaceId: WorkspaceId,
  spaceId: SpaceId,
  name: Schema.optional(SpaceName),
  icon: Schema.optional(Schema.NullOr(SpaceIcon)),
});
export type SpacePatchInput = typeof SpacePatchInputSchema.Type;

export const SpaceDeleteInputSchema = Schema.Struct({
  workspaceId: WorkspaceId,
  spaceId: SpaceId,
});
export type SpaceDeleteInput = typeof SpaceDeleteInputSchema.Type;
