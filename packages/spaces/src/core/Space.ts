import {
  Emoji,
  ImageSrc,
  Name,
  SpaceId,
} from "@typebot.io/domain-primitives/schemas";
import { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Schema } from "effect";

export const SpaceIcon = Schema.Union(Emoji, ImageSrc);
export type SpaceIcon = typeof SpaceIcon.Type;

export class Space extends Schema.Class<Space>("Space")({
  id: SpaceId,
  name: Name,
  icon: Schema.NullOr(SpaceIcon),
  workspaceId: WorkspaceId,
  createdAt: Schema.ValidDateFromSelf,
  updatedAt: Schema.ValidDateFromSelf,
}) {}

export const SpaceCreateInputSchema = Schema.Struct({
  name: Name.pipe(Schema.minLength(1)),
  icon: Schema.optional(SpaceIcon),
});
export type SpaceCreateInputSchema = typeof SpaceCreateInputSchema.Type;
export const SpaceCreateInputStandardSchema = SpaceCreateInputSchema.pipe(
  Schema.standardSchemaV1,
);
