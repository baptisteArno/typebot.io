import { SpaceId, WorkspaceId } from "@typebot.io/shared-primitives/domain";
import { Schema } from "effect";
import {
  ContactPropertyDefinitionId,
  ContactPropertyDefinitionKey,
  ContactPropertyTypeSchema,
} from "./ContactPropertyDefinition";

export const ContactId = Schema.String.pipe(Schema.brand("ContactId"));
export type ContactId = typeof ContactId.Type;

export const ContactPropertyValue = Schema.Union([
  Schema.String,
  Schema.Number,
]);
export type ContactPropertyValue = typeof ContactPropertyValue.Type;

export class ContactProperty extends Schema.Class<ContactProperty>(
  "ContactProperty",
)({
  key: ContactPropertyDefinitionKey,
  definitionId: ContactPropertyDefinitionId,
  type: ContactPropertyTypeSchema,
  value: ContactPropertyValue,
}) {}

export class Contact extends Schema.Class<Contact>("Contact")({
  id: ContactId,
  name: Schema.NullOr(Schema.String),
  workspaceId: WorkspaceId,
  spaceId: Schema.NullOr(SpaceId),
  createdAt: Schema.DateValid,
  updatedAt: Schema.DateValid,
  properties: Schema.Array(ContactProperty),
}) {}
