import { Schema } from "effect";

export class ContactsAlreadyExistsError extends Schema.TaggedErrorClass<ContactsAlreadyExistsError>()(
  "ContactsAlreadyExistsError",
  {},
) {}

export class ContactsForbiddenError extends Schema.TaggedErrorClass<ContactsForbiddenError>()(
  "ContactsForbiddenError",
  {},
) {}

export class ContactsNotFoundError extends Schema.TaggedErrorClass<ContactsNotFoundError>()(
  "ContactsNotFoundError",
  {},
) {}

export class ContactPropertyDefinitionsAlreadyExistsError extends Schema.TaggedErrorClass<ContactPropertyDefinitionsAlreadyExistsError>()(
  "ContactPropertyDefinitionsAlreadyExistsError",
  {},
) {}

export class ContactPropertyDefinitionsNotFoundError extends Schema.TaggedErrorClass<ContactPropertyDefinitionsNotFoundError>()(
  "ContactPropertyDefinitionsNotFoundError",
  {},
) {}
