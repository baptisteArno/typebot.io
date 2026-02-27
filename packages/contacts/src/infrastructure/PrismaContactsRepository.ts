import type { AudienceId } from "@typebot.io/audiences/core";
import { PrismaService } from "@typebot.io/prisma/effect";
import { PrismaClientKnownRequestError } from "@typebot.io/prisma/enum";
import { Effect, Layer, Schema } from "effect";
import {
  Contact,
  type ContactCreateInput,
  type ContactId,
} from "../core/Contact";
import { AlreadyExistsError, NotFoundError } from "../core/ContactsErrors";
import { ContactsRepository } from "../core/ContactsRepository";

export const PrismaContactsRepository = Layer.effect(
  ContactsRepository,
  Effect.gen(function* () {
    const prisma = yield* PrismaService;

    const listByAudienceId = Effect.fn(
      "PrismaContactsRepository.listByAudienceId",
    )(function* (
      audienceId: AudienceId,
      pagination: { limit: number; cursor?: number },
    ) {
      const { limit, cursor } = pagination;
      const skip = cursor ?? 0;

      const contacts = yield* prisma.contact
        .findMany({
          where: { audienceId },
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
      audienceId: AudienceId,
      input: ContactCreateInput,
    ) {
      const contact = yield* prisma.contact
        .create({
          data: {
            audienceId,
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
            properties: input.customAttributes,
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
      audienceId: AudienceId,
      contactId: ContactId,
    ) {
      const contact = yield* prisma.contact
        .findFirst({
          where: { id: contactId, audienceId },
        })
        .pipe(Effect.orDie);

      if (!contact) return yield* new NotFoundError();

      return yield* Schema.decodeUnknown(Contact)(contact).pipe(Effect.orDie);
    });

    return ContactsRepository.of({
      listByAudienceId,
      create,
      getById,
    });
  }),
);
