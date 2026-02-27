import { Schema } from "effect";

export class AlreadyExistsError extends Schema.TaggedError<AlreadyExistsError>()(
  "AudiencesAlreadyExistsError",
  {},
) {}

export class ForbiddenError extends Schema.TaggedError<ForbiddenError>()(
  "AudiencesForbiddenError",
  {},
) {}
