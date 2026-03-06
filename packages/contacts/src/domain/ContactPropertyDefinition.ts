import { SpaceId, WorkspaceId } from "@typebot.io/shared-primitives/domain";
import { Schema } from "effect";

export const ContactPropertyDefinitionId = Schema.Int.pipe(
  Schema.check(Schema.isGreaterThan(0)),
  Schema.brand("ContactPropertyDefinitionId"),
);
export type ContactPropertyDefinitionId =
  typeof ContactPropertyDefinitionId.Type;

export const ContactPropertyDefinitionKey = Schema.NonEmptyString.pipe(
  Schema.brand("ContactPropertyDefinitionKey"),
);
export type ContactPropertyDefinitionKey =
  typeof ContactPropertyDefinitionKey.Type;

export const ContactPropertyTypeSchema = Schema.Literals([
  "STRING",
  "NUMBER",
  "EMAIL",
  "PHONE",
  "URL",
  "IMAGE_URL",
]);
export type ContactPropertyType = typeof ContactPropertyTypeSchema.Type;

export class ContactPropertyDefinition extends Schema.Class<ContactPropertyDefinition>(
  "ContactPropertyDefinition",
)({
  id: ContactPropertyDefinitionId,
  key: ContactPropertyDefinitionKey,
  type: ContactPropertyTypeSchema,
  isUnique: Schema.Boolean,
  workspaceId: WorkspaceId,
  spaceId: Schema.NullOr(SpaceId),
}) {}

export type ContactPropertyDefinitionData =
  typeof ContactPropertyDefinition.Type;
