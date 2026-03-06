import { Schema } from "effect";

export class SpacesAlreadyExistsError extends Schema.TaggedError<SpacesAlreadyExistsError>()(
  "SpacesAlreadyExistsError",
  {},
) {}

export class SpacesForbiddenError extends Schema.TaggedError<SpacesForbiddenError>()(
  "SpacesForbiddenError",
  {},
) {}
