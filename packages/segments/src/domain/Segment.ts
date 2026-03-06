import {
  SegmentId,
  SpaceId,
  WorkspaceId,
} from "@typebot.io/shared-primitives/domain";
import { Schema } from "effect";

export const SegmentName = Schema.NonEmptyString.pipe(
  Schema.brand("SegmentName"),
);

export class Segment extends Schema.Class<Segment>("Segment")({
  id: SegmentId,
  name: SegmentName,
  workspaceId: WorkspaceId,
  spaceId: Schema.NullOr(SpaceId),
}) {}
