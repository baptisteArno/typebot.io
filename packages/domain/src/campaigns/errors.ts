import { Schema } from "effect";

export class AlreadyExistsError extends Schema.TaggedError<AlreadyExistsError>()(
  "CampaignsAlreadyExistsError",
  {},
) {}

export class ForbiddenError extends Schema.TaggedError<ForbiddenError>()(
  "CampaignsForbiddenError",
  {},
) {}

export class NotFoundError extends Schema.TaggedError<NotFoundError>()(
  "CampaignsNotFoundError",
  {},
) {}
