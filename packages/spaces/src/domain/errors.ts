import { Schema } from "effect";

export class SpacesAlreadyExistsError extends Schema.TaggedErrorClass<SpacesAlreadyExistsError>()(
  "SpacesAlreadyExistsError",
  {},
) {}

export class SpacesForbiddenError extends Schema.TaggedErrorClass<SpacesForbiddenError>()(
  "SpacesForbiddenError",
  {},
) {}
