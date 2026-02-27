import { Icon, Name } from "@typebot.io/domain-primitives/schemas";
import { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Schema } from "effect";

export const AudienceId = Schema.String.pipe(Schema.brand("AudienceId"));
export type AudienceId = typeof AudienceId.Type;

export const SpaceId = Schema.String.pipe(Schema.brand("SpaceId"));
export type SpaceId = typeof SpaceId.Type;

export class Space extends Schema.Class<Space>("Space")({
  id: SpaceId,
  name: Name,
  icon: Schema.NullOr(Icon),
  workspaceId: WorkspaceId,

  createdAt: Schema.ValidDateFromSelf,
  updatedAt: Schema.ValidDateFromSelf,
}) {}

export const SpaceCreateInputSchema = Schema.Struct({
  name: Name.pipe(Schema.minLength(1)),
  icon: Icon.pipe(Schema.optional),
  audienceId: AudienceId.pipe(Schema.optional),
});
export type SpaceCreateInputSchema = typeof SpaceCreateInputSchema.Type;
export const SpaceCreateInputStandardSchema = SpaceCreateInputSchema.pipe(
  Schema.standardSchemaV1,
);
