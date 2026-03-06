import type { Prisma } from "@prisma/client";
import { PrismaService } from "@typebot.io/prisma/effect";
import { PrismaClientKnownRequestError } from "@typebot.io/prisma/enum";
import type { SpaceId } from "@typebot.io/shared-primitives/domain";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Layer, Schema } from "effect";
import {
  type ContactRepoCreateInput,
  ContactsRepo,
} from "../application/ContactsRepo";
import { Contact, type ContactId } from "../domain/Contact";
import {
  ContactsAlreadyExistsError,
  ContactsNotFoundError,
} from "../domain/errors";

const mapPrismaContactToDomain = (
  row: Prisma.ContactGetPayload<{
    include: { properties: { include: { definition: true } } };
  }>,
): typeof Contact.Encoded => ({
  id: row.id,
  name: row.name,
  workspaceId: row.workspaceId,
  spaceId: row.spaceId,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  properties: row.properties.reduce<
    Array<(typeof Contact.Encoded)["properties"][number]>
  >((acc, p) => {
    if (p.valueNumber !== null) {
      acc.push({
        key: p.definition.key,
        definitionId: p.definitionId,
        type: "NUMBER",
        value: p.valueNumber,
      });
    } else if (p.valueString !== null && p.definition.type !== "NUMBER") {
      acc.push({
        key: p.definition.key,
        definitionId: p.definitionId,
        type: p.definition.type,
        value: p.valueString,
      });
    }
    return acc;
  }, []),
});

export const PrismaContactsRepository = Layer.effect(
  ContactsRepo,
  Effect.gen(function* () {
    const prisma = yield* PrismaService;

    const list = Effect.fn("PrismaContactsRepository.list")(function* (
      pagination: { limit: number; cursor?: number; q?: string },
      scope: { workspaceId: WorkspaceId; spaceId?: SpaceId },
    ) {
      const { limit, cursor, q } = pagination;
      const skip = cursor ?? 0;

      const searchFilter =
        q && q.trim() !== ""
          ? {
              OR: [
                { name: { contains: q.trim(), mode: "insensitive" as const } },
                {
                  properties: {
                    some: {
                      valueString: {
                        contains: q.trim(),
                        mode: "insensitive" as const,
                      },
                    },
                  },
                },
              ],
            }
          : undefined;

      const contacts = yield* prisma.contact
        .findMany({
          where: {
            workspaceId: scope.workspaceId,
            ...(scope.spaceId !== undefined && { spaceId: scope.spaceId }),
            ...searchFilter,
          },
          orderBy: { createdAt: "desc" },
          take: limit + 1,
          skip,
          include: {
            properties: { include: { definition: true } },
          },
        })
        .pipe(Effect.orDie);

      const hasMore = contacts.length > limit;
      const paginatedContacts = hasMore ? contacts.slice(0, limit) : contacts;
      const nextCursor = hasMore ? skip + limit : undefined;

      const mapped = paginatedContacts.map(mapPrismaContactToDomain);
      const decoded = yield* Schema.decodeUnknownEffect(Schema.Array(Contact))(
        mapped,
      ).pipe(Effect.orDie);

      return { contacts: decoded, nextCursor };
    });

    const existsContactWithUniquePropertyValues = Effect.fn(
      "PrismaContactsRepository.existsContactWithUniquePropertyValues",
    )(function* (
      pairs: ReadonlyArray<{ definitionId: number; valueString: string }>,
      scope: { workspaceId: WorkspaceId; spaceId?: SpaceId },
    ) {
      if (pairs.length === 0) return false;
      const contactFilter = {
        workspaceId: scope.workspaceId,
        ...(scope.spaceId !== undefined
          ? { spaceId: scope.spaceId }
          : { spaceId: null }),
      };
      const existing = yield* prisma.contactProperty
        .findFirst({
          where: {
            OR: pairs.map(({ definitionId, valueString }) => ({
              definitionId,
              valueString,
              contact: contactFilter,
            })),
          },
        })
        .pipe(Effect.orDie);
      return existing !== null;
    });

    const create = Effect.fn("PrismaContactsRepository.create")(function* (
      input: ContactRepoCreateInput,
    ) {
      const propertyCreates = input.properties.map((p) => ({
        definitionId: p.definitionId,
        valueString: p.valueString,
        valueNumber: p.valueNumber,
      }));

      const contact = yield* prisma.contact
        .create({
          data: {
            workspaceId: input.workspaceId,
            spaceId: input.spaceId ?? null,
            name: input.name ?? null,
            ...(propertyCreates.length > 0 && {
              properties: { create: propertyCreates },
            }),
          },
          include: {
            properties: { include: { definition: true } },
          },
        })
        .pipe(
          Effect.catch((error) =>
            error instanceof PrismaClientKnownRequestError &&
            error.code === "P2002"
              ? Effect.fail(new ContactsAlreadyExistsError())
              : Effect.die(error),
          ),
        );

      const mapped = mapPrismaContactToDomain(contact);
      return yield* Schema.decodeUnknownEffect(Contact)(mapped).pipe(
        Effect.orDie,
      );
    });

    const getById = Effect.fn("PrismaContactsRepository.getById")(function* (
      contactId: ContactId,
      scope: { workspaceId: WorkspaceId; spaceId?: SpaceId },
    ) {
      const contact = yield* prisma.contact
        .findFirst({
          where: {
            id: contactId,
            workspaceId: scope.workspaceId,
            ...(scope.spaceId !== undefined && { spaceId: scope.spaceId }),
          },
          include: {
            properties: { include: { definition: true } },
          },
        })
        .pipe(Effect.orDie);

      if (!contact) return yield* new ContactsNotFoundError();

      const mapped = mapPrismaContactToDomain(contact);
      return yield* Schema.decodeUnknownEffect(Contact)(mapped).pipe(
        Effect.orDie,
      );
    });

    const delete_ = Effect.fn("PrismaContactsRepository.delete")(function* (
      contactId: ContactId,
      scope: { workspaceId: WorkspaceId; spaceId?: SpaceId },
    ) {
      const result = yield* prisma.contact
        .deleteMany({
          where: {
            id: contactId,
            workspaceId: scope.workspaceId,
            ...(scope.spaceId !== undefined && { spaceId: scope.spaceId }),
          },
        })
        .pipe(Effect.orDie);

      if (result.count === 0) return yield* new ContactsNotFoundError();
    });

    const deleteMany = Effect.fn("PrismaContactsRepository.deleteMany")(
      function* (
        contactIds: readonly ContactId[],
        scope: { workspaceId: WorkspaceId; spaceId?: SpaceId },
      ) {
        yield* prisma.contact
          .deleteMany({
            where: {
              id: { in: [...contactIds] },
              workspaceId: scope.workspaceId,
              ...(scope.spaceId !== undefined && { spaceId: scope.spaceId }),
            },
          })
          .pipe(Effect.orDie);
      },
    );

    return ContactsRepo.of({
      list,
      existsContactWithUniquePropertyValues,
      create,
      getById,
      delete: delete_,
      deleteMany,
    });
  }),
);
