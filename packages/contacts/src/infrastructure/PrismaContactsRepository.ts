import type { SpaceId } from "@typebot.io/domain/shared-primitives";
import { PrismaService } from "@typebot.io/prisma/effect";
import { PrismaClientKnownRequestError } from "@typebot.io/prisma/enum";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Layer, Schema } from "effect";
import { ContactsRepo } from "../application/ContactsRepo";
import {
  Contact,
  type ContactCreateInput,
  type ContactId,
} from "../core/Contact";
import { AlreadyExistsError, NotFoundError } from "../core/ContactsErrors";

export const PrismaContactsRepository = Layer.effect(
  ContactsRepo,
  Effect.gen(function* () {
    const prisma = yield* PrismaService;

    const listByWorkspaceAndSpace = Effect.fn(
      "PrismaContactsRepository.listByWorkspaceAndSpace",
    )(function* (
      workspaceId: WorkspaceId,
      spaceId: SpaceId | undefined,
      pagination: { limit: number; cursor?: number },
    ) {
      const { limit, cursor } = pagination;
      const skip = cursor ?? 0;

      const contacts = yield* prisma.contact
        .findMany({
          where: {
            workspaceId,
            ...(spaceId !== undefined && { spaceId }),
          },
          orderBy: { createdAt: "desc" },
          take: limit + 1,
          skip,
        })
        .pipe(Effect.orDie);

      const hasMore = contacts.length > limit;
      const paginatedContacts = hasMore ? contacts.slice(0, limit) : contacts;
      const nextCursor = hasMore ? skip + limit : undefined;

      const decoded = yield* Schema.decodeUnknown(Schema.Array(Contact))(
        paginatedContacts,
      ).pipe(Effect.orDie);

      return { contacts: decoded, nextCursor };
    });

    const create = Effect.fn("PrismaContactsRepository.create")(function* (
      workspaceId: WorkspaceId,
      spaceId: SpaceId | undefined,
      input: ContactCreateInput,
    ) {
      const contact = yield* prisma.contact
        .create({
          data: {
            workspaceId,
            spaceId: spaceId ?? null,
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
          },
        })
        .pipe(
          Effect.catchAll((error) =>
            error instanceof PrismaClientKnownRequestError &&
            error.code === "P2002"
              ? Effect.fail(new AlreadyExistsError())
              : Effect.die(error),
          ),
        );

      return yield* Schema.decodeUnknown(Contact)(contact).pipe(Effect.orDie);
    });

    const getById = Effect.fn("PrismaContactsRepository.getById")(function* (
      workspaceId: WorkspaceId,
      spaceId: SpaceId | undefined,
      contactId: ContactId,
    ) {
      const contact = yield* prisma.contact
        .findFirst({
          where: {
            id: contactId,
            workspaceId,
            ...(spaceId !== undefined && { spaceId }),
          },
        })
        .pipe(Effect.orDie);

      if (!contact) return yield* new NotFoundError();

      return yield* Schema.decodeUnknown(Contact)(contact).pipe(Effect.orDie);
    });

    return ContactsRepo.of({
      listByWorkspaceAndSpace,
      create,
      getById,
    });
  }),
);
