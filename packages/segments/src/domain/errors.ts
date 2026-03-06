import { Schema } from "effect";

export class SegmentsAlreadyExistsError extends Schema.TaggedErrorClass<SegmentsAlreadyExistsError>()(
  "SegmentsAlreadyExistsError",
  {},
) {}

export class SegmentsForbiddenError extends Schema.TaggedErrorClass<SegmentsForbiddenError>()(
  "SegmentsForbiddenError",
  {},
) {}
