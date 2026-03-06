import { Schema } from "effect";

export class ContactsAlreadyExistsError extends Schema.TaggedError<ContactsAlreadyExistsError>()(
  "ContactsAlreadyExistsError",
  {},
) {}

export class ContactsForbiddenError extends Schema.TaggedError<ContactsForbiddenError>()(
  "ContactsForbiddenError",
  {},
) {}

export class ContactsNotFoundError extends Schema.TaggedError<ContactsNotFoundError>()(
  "ContactsNotFoundError",
  {},
) {}
