import { Schema } from "effect";

export class CampaignsAlreadyExistsError extends Schema.TaggedError<CampaignsAlreadyExistsError>()(
  "CampaignsAlreadyExistsError",
  {},
) {}

export class CampaignsForbiddenError extends Schema.TaggedError<CampaignsForbiddenError>()(
  "CampaignsForbiddenError",
  {},
) {}

export class CampaignsNotFoundError extends Schema.TaggedError<CampaignsNotFoundError>()(
  "CampaignsNotFoundError",
  {},
) {}
