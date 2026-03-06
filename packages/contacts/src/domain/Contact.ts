import {
  Email,
  PhoneNumber,
  SpaceId,
  WorkspaceId,
} from "@typebot.io/shared-primitives/domain";
import { Schema } from "effect";

export const ContactId = Schema.String.pipe(Schema.brand("ContactId"));
export type ContactId = typeof ContactId.Type;

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
