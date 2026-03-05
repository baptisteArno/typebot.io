import type { SpaceId } from "@typebot.io/domain-primitives/schemas";
import type { UserId } from "@typebot.io/user/schemas";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Context, Effect, Layer } from "effect";
import type { Contact, ContactCreateInput, ContactId } from "../core/Contact";
import {
  type AlreadyExistsError,
  ForbiddenError,
  type NotFoundError,
} from "../core/ContactsErrors";
import { ContactsAuthorization } from "./ContactsAuthorization";
import { ContactsRepo } from "./ContactsRepo";

export class ContactsUsecases extends Context.Tag(
  "@typebot.io/ContactsUsecases",
)<
  ContactsUsecases,
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
    ContactsUsecases,
    Effect.gen(function* () {
      const contactsRepo = yield* ContactsRepo;
      const contactsAuthorization = yield* ContactsAuthorization;

      const list = Effect.fn("ContactsUsecases.list")(function* (
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

        return yield* contactsRepo.listByWorkspaceAndSpace(
          workspaceId,
          spaceId,
          pagination,
        );
      });

      const create = Effect.fn("ContactsUsecases.create")(function* (
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

        return yield* contactsRepo.create(workspaceId, spaceId, input);
      });

      const get = Effect.fn("ContactsUsecases.get")(function* ({
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

        return yield* contactsRepo.getById(workspaceId, spaceId, contactId);
      });

      return ContactsUsecases.of({
        list,
        create,
        get,
      });
    }),
  );
}
