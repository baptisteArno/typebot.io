import { Schema } from "effect";

export const Email = Schema.NonEmptyString.pipe(Schema.brand("Email"));
export type Email = typeof Email.Type;

export const PhoneNumber = Schema.NonEmptyString.pipe(
  Schema.brand("PhoneNumber"),
);
export type PhoneNumber = typeof PhoneNumber.Type;

export const CampaignRunId = Schema.NonEmptyString.pipe(
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
