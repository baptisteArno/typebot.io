import { Schema } from "effect";

export const Email = Schema.String.pipe(
  Schema.nonEmptyString(),
  Schema.brand("Email"),
);
export type Email = typeof Email.Type;

export const PhoneNumber = Schema.String.pipe(
  Schema.nonEmptyString(),
  Schema.brand("PhoneNumber"),
);
export type PhoneNumber = typeof PhoneNumber.Type;

export const CampaignRunId = Schema.String.pipe(
  Schema.nonEmptyString(),
  Schema.brand("CampaignRunId"),
);
export type CampaignRunId = typeof CampaignRunId.Type;

export {
  CampaignId,
  CredentialsId,
  SegmentId,
  SpaceId,
  TypebotId,
  UserId,
  WorkspaceId,
} from "@typebot.io/shared-core/domain";
export { Emoji, ImageSrc } from "@typebot.io/shared-core/schemas";
