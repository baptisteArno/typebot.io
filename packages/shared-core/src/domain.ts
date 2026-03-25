import { Schema } from "effect";

export const SpaceId = Schema.NonEmptyString.pipe(Schema.brand("SpaceId"));
export type SpaceId = typeof SpaceId.Type;

export const TypebotId = Schema.NonEmptyString.pipe(Schema.brand("TypebotId"));
export type TypebotId = typeof TypebotId.Type;

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

export const Email = Schema.NonEmptyString.pipe(Schema.brand("Email"));
export type Email = typeof Email.Type;

export const PhoneNumber = Schema.NonEmptyString.pipe(
  Schema.brand("PhoneNumber"),
);
export type PhoneNumber = typeof PhoneNumber.Type;
