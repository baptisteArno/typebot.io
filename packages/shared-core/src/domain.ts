import { Schema } from "effect";

export const SpaceId = Schema.NonEmptyString.pipe(Schema.brand("SpaceId"));
export type SpaceId = typeof SpaceId.Type;

export const CampaignId = Schema.NonEmptyString.pipe(
  Schema.brand("CampaignId"),
);
export type CampaignId = typeof CampaignId.Type;

export const TypebotId = Schema.NonEmptyString.pipe(Schema.brand("TypebotId"));
export type TypebotId = typeof TypebotId.Type;

export const SegmentId = Schema.NonEmptyString.pipe(Schema.brand("SegmentId"));
export type SegmentId = typeof SegmentId.Type;

export const CredentialsId = Schema.NonEmptyString.pipe(
  Schema.brand("CredentialsId"),
);
export type CredentialsId = typeof CredentialsId.Type;

export const UserId = Schema.NonEmptyString.pipe(Schema.brand("UserId"));
export type UserId = typeof UserId.Type;

export const WorkspaceId = Schema.NonEmptyString.pipe(
  Schema.brand("WorkspaceId"),
);
export type WorkspaceId = typeof WorkspaceId.Type;
