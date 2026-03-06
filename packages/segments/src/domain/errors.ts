import { Schema } from "effect";

export class SegmentsAlreadyExistsError extends Schema.TaggedError<SegmentsAlreadyExistsError>()(
  "SegmentsAlreadyExistsError",
  {},
) {}

export class SegmentsForbiddenError extends Schema.TaggedError<SegmentsForbiddenError>()(
  "SegmentsForbiddenError",
  {},
) {}
