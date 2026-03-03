import type { SpaceId } from "@typebot.io/domain-primitives/schemas";
import type { UserId } from "@typebot.io/user/schemas";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Context, Effect, Layer } from "effect";
import type { Contact, ContactCreateInput, ContactId } from "./Contact";
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
      resource: {
        workspaceId: WorkspaceId;
        spaceId?: SpaceId;
        userId: UserId;
      },
      pagination: { limit: number; cursor?: number },
    ) => Effect.Effect<
      { contacts: readonly Contact[]; nextCursor: number | undefined },
      ForbiddenError
    >;
    readonly create: (
      resource: {
        workspaceId: WorkspaceId;
        spaceId?: SpaceId;
        userId: UserId;
      },
      input: ContactCreateInput,
    ) => Effect.Effect<Contact, AlreadyExistsError | ForbiddenError>;
    readonly get: (resource: {
      workspaceId: WorkspaceId;
      spaceId?: SpaceId;
      contactId: ContactId;
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
        {
          workspaceId,
          spaceId,
          userId,
        }: {
          workspaceId: WorkspaceId;
          spaceId?: SpaceId;
          userId: UserId;
        },
        pagination: { limit: number; cursor?: number },
      ) {
        const canList = yield* contactsAuthorization.canListContacts(
          workspaceId,
          spaceId,
          userId,
        );

        if (!canList) return yield* new ForbiddenError();

        return yield* contactsRepository.listByWorkspaceAndSpace(
          workspaceId,
          spaceId,
          pagination,
        );
      });

      const create = Effect.fn("Contacts.create")(function* (
        {
          workspaceId,
          spaceId,
          userId,
        }: {
          workspaceId: WorkspaceId;
          spaceId?: SpaceId;
          userId: UserId;
        },
        input: ContactCreateInput,
      ) {
        const canCreate = yield* contactsAuthorization.canCreateContact(
          workspaceId,
          spaceId,
          userId,
        );

        if (!canCreate) return yield* new ForbiddenError();

        return yield* contactsRepository.create(workspaceId, spaceId, input);
      });

      const get = Effect.fn("Contacts.get")(function* ({
        workspaceId,
        spaceId,
        contactId,
        userId,
      }: {
        workspaceId: WorkspaceId;
        spaceId?: SpaceId;
        contactId: ContactId;
        userId: UserId;
      }) {
        const canGet = yield* contactsAuthorization.canGetContact(
          workspaceId,
          spaceId,
          userId,
        );

        if (!canGet) return yield* new ForbiddenError();

        return yield* contactsRepository.getById(
          workspaceId,
          spaceId,
          contactId,
        );
      });

      return Contacts.of({
        list,
        create,
        get,
      });
    }),
  );
}
