import { Schema } from "effect";

export class AlreadyExistsError extends Schema.TaggedError<AlreadyExistsError>()(
  "SpacesAlreadyExistsError",
  {},
) {}

export class ForbiddenError extends Schema.TaggedError<ForbiddenError>()(
  "SpacesForbiddenError",
  {},
) {}
