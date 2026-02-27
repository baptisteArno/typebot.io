import type { AudienceId } from "@typebot.io/audiences/core";
import { Context, type Effect } from "effect";
import type { Contact, ContactCreateInput, ContactId } from "./Contact";
import type { AlreadyExistsError, NotFoundError } from "./ContactsErrors";

export class ContactsRepository extends Context.Tag(
  "@typebot.io/ContactsRepository",
)<
  ContactsRepository,
  {
    readonly listByAudienceId: (
      audienceId: AudienceId,
      pagination: { limit: number; cursor?: number },
    ) => Effect.Effect<{
      contacts: readonly Contact[];
      nextCursor: number | undefined;
    }>;
    readonly create: (
      audienceId: AudienceId,
      input: ContactCreateInput,
    ) => Effect.Effect<Contact, AlreadyExistsError>;
    readonly getById: (
      audienceId: AudienceId,
      contactId: ContactId,
    ) => Effect.Effect<Contact, NotFoundError>;
  }
>() {}
