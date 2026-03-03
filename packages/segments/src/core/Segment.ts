import {
  Name,
  SegmentId,
  SpaceId,
} from "@typebot.io/domain-primitives/schemas";
import { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Schema } from "effect";

export class Segment extends Schema.Class<Segment>("Segment")({
  id: SegmentId,
  name: Name,
  workspaceId: WorkspaceId,
  spaceId: Schema.NullOr(SpaceId),
}) {}

export const SegmentCreateInputSchema = Schema.Struct({
  name: Name.pipe(Schema.minLength(1)),
});
export type SegmentCreateInputSchema = typeof SegmentCreateInputSchema.Type;
export const SegmentCreateInputStandardSchema = SegmentCreateInputSchema.pipe(
  Schema.standardSchemaV1,
);
