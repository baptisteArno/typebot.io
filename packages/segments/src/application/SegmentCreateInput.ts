import { Schema } from "effect";
import { SegmentName } from "../domain/Segment";

export const SegmentCreateInputSchema = Schema.Struct({
  name: SegmentName,
});
export type SegmentCreateInput = typeof SegmentCreateInputSchema.Type;
