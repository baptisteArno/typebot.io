import type { AudienceId } from "@typebot.io/audiences/core/Audience";
import type { UserId } from "@typebot.io/user/schemas";
import { Context, Effect, Layer } from "effect";
import type { Contact, ContactCreateInput } from "./Contact";
import { ContactsAuthorization } from "./ContactsAuthorization";
import {
  type AlreadyExistsError,
  ForbiddenError,
  type NotFoundError,
} from "./ContactsErrors";
import { ContactsRepository } from "./ContactsRepository";

export class Contacts extends Context.Tag("@typebot.io/Contacts")<
  Contacts,
  {
    readonly list: (
      resource: { audienceId: AudienceId; userId: UserId },
      pagination: { limit: number; cursor?: number },
    ) => Effect.Effect<
      { contacts: readonly Contact[]; nextCursor: number | undefined },
      ForbiddenError
    >;
    readonly create: (
      resource: { audienceId: AudienceId; userId: UserId },
      input: ContactCreateInput,
    ) => Effect.Effect<Contact, AlreadyExistsError | ForbiddenError>;
    readonly get: (resource: {
      audienceId: AudienceId;
      contactId: number;
      userId: UserId;
    }) => Effect.Effect<Contact, ForbiddenError | NotFoundError>;
  }
>() {
  static readonly layer = Layer.effect(
    Contacts,
    Effect.gen(function* () {
      const contactsRepository = yield* ContactsRepository;
      const contactsAuthorization = yield* ContactsAuthorization;

      const list = Effect.fn("Contacts.list")(function* (
        { audienceId, userId }: { audienceId: AudienceId; userId: UserId },
        pagination: { limit: number; cursor?: number },
      ) {
        const canList = yield* contactsAuthorization.canListContacts(
          audienceId,
          userId,
        );

        if (!canList) return yield* new ForbiddenError();

        return yield* contactsRepository.listByAudienceId(
          audienceId,
          pagination,
        );
      });

      const create = Effect.fn("Contacts.create")(function* (
        { audienceId, userId }: { audienceId: AudienceId; userId: UserId },
        input: ContactCreateInput,
      ) {
        const canCreate = yield* contactsAuthorization.canCreateContact(
          audienceId,
          userId,
        );

        if (!canCreate) return yield* new ForbiddenError();

        return yield* contactsRepository.create(audienceId, input);
      });

      const get = Effect.fn("Contacts.get")(function* ({
        audienceId,
        contactId,
        userId,
      }: {
        audienceId: AudienceId;
        contactId: number;
        userId: UserId;
      }) {
        const canGet = yield* contactsAuthorization.canGetContact(
          audienceId,
          userId,
        );

        if (!canGet) return yield* new ForbiddenError();

        return yield* contactsRepository.getById(audienceId, contactId);
      });

      return Contacts.of({
        list,
        create,
        get,
      });
    }),
  );
}
