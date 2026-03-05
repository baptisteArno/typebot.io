import { Schema } from "effect";
import {
  Emoji,
  ImageSrc,
  Name,
  SpaceId,
  WorkspaceId,
} from "../shared-primitives";

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
