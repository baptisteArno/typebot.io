import {
  Email,
  PhoneNumber,
  SpaceId,
} from "@typebot.io/domain-primitives/schemas";
import { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Schema } from "effect";

export const ContactId = Schema.String.pipe(Schema.brand("ContactId"));
export type ContactId = typeof ContactId.Type;

const CustomAttributeValue = Schema.Union(
  Schema.String,
  Schema.JsonNumber,
  Schema.Boolean,
);

const CustomAttributesSchema = Schema.Record({
  key: Schema.String,
  value: CustomAttributeValue,
});

export class Contact extends Schema.Class<Contact>("Contact")({
  id: ContactId,
  firstName: Schema.NullOr(Schema.String),
  lastName: Schema.NullOr(Schema.String),
  email: Schema.NullOr(Email),
  phone: Schema.NullOr(PhoneNumber),
  workspaceId: WorkspaceId,
  spaceId: Schema.NullOr(SpaceId),
  createdAt: Schema.ValidDateFromSelf,
  updatedAt: Schema.ValidDateFromSelf,
}) {}

export const ContactCreateInputSchema = Schema.Struct({
  firstName: Schema.optional(Schema.String),
  lastName: Schema.optional(Schema.String),
  email: Schema.optional(Schema.String),
  phone: Schema.optional(Schema.String),
  customAttributes: Schema.optional(CustomAttributesSchema),
});
export type ContactCreateInput = typeof ContactCreateInputSchema.Type;
