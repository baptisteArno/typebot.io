import { Schema } from "effect";

export const SpaceId = Schema.String.pipe(
  Schema.nonEmptyString(),
  Schema.brand("SpaceId"),
);
export type SpaceId = typeof SpaceId.Type;

export const CampaignId = Schema.String.pipe(
  Schema.nonEmptyString(),
  Schema.brand("CampaignId"),
);
export type CampaignId = typeof CampaignId.Type;

export const TypebotId = Schema.String.pipe(
  Schema.nonEmptyString(),
  Schema.brand("TypebotId"),
);
export type TypebotId = typeof TypebotId.Type;

export const SegmentId = Schema.String.pipe(
  Schema.nonEmptyString(),
  Schema.brand("SegmentId"),
);
export type SegmentId = typeof SegmentId.Type;

export const CredentialsId = Schema.String.pipe(
  Schema.nonEmptyString(),
  Schema.brand("CredentialsId"),
);
export type CredentialsId = typeof CredentialsId.Type;

export const UserId = Schema.String.pipe(
  Schema.nonEmptyString(),
  Schema.brand("UserId"),
);
export type UserId = typeof UserId.Type;

export const WorkspaceId = Schema.String.pipe(
  Schema.nonEmptyString(),
  Schema.brand("WorkspaceId"),
);
export type WorkspaceId = typeof WorkspaceId.Type;
