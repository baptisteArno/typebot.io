import { Schema } from "effect";

export class AlreadyExistsError extends Schema.TaggedError<AlreadyExistsError>()(
  "ContactsAlreadyExistsError",
  {},
) {}

export class ForbiddenError extends Schema.TaggedError<ForbiddenError>()(
  "ContactsForbiddenError",
  {},
) {}

export class NotFoundError extends Schema.TaggedError<NotFoundError>()(
  "ContactsNotFoundError",
  {},
) {}
