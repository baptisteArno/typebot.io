import { Schema } from "effect";

export class CampaignsAlreadyExistsError extends Schema.TaggedErrorClass<CampaignsAlreadyExistsError>()(
  "CampaignsAlreadyExistsError",
  {},
) {}

export class CampaignsForbiddenError extends Schema.TaggedErrorClass<CampaignsForbiddenError>()(
  "CampaignsForbiddenError",
  {},
) {}

export class CampaignsNotFoundError extends Schema.TaggedErrorClass<CampaignsNotFoundError>()(
  "CampaignsNotFoundError",
  {},
) {}
