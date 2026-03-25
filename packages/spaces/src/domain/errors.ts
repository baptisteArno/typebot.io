import { Schema } from "effect";

export class SpaceAlreadyExistsError extends Schema.TaggedErrorClass<SpaceAlreadyExistsError>()(
  "SpaceAlreadyExistsError",
  {},
) {}

export class SpaceNotFoundError extends Schema.TaggedErrorClass<SpaceNotFoundError>()(
  "SpaceNotFoundError",
  {},
) {}

export class ForbiddenSpaceAccessError extends Schema.TaggedErrorClass<ForbiddenSpaceAccessError>()(
  "ForbiddenSpaceAccessError",
  {},
) {}

export class SpacesFeatureDisabledError extends Schema.TaggedErrorClass<SpacesFeatureDisabledError>()(
  "SpacesFeatureDisabledError",
  {},
) {}
