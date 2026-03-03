import { Schema } from "effect";

export class AlreadyExistsError extends Schema.TaggedError<AlreadyExistsError>()(
  "SegmentsAlreadyExistsError",
  {},
) {}

export class ForbiddenError extends Schema.TaggedError<ForbiddenError>()(
  "SegmentsForbiddenError",
  {},
) {}
