import { PrismaService } from "@typebot.io/prisma/effect";
import { PrismaClientKnownRequestError } from "@typebot.io/prisma/enum";
import type { SpaceId } from "@typebot.io/shared-primitives/domain";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Layer, Schema } from "effect";
import { ContactPropertyDefinitionsRepo } from "../application/ContactPropertyDefinitionsRepo";
import type {
  ContactPropertyDefinitionCreateInput,
  ContactPropertyDefinitionDeleteInput,
  ContactPropertyDefinitionUpdateInput,
} from "../application/ContactPropertyDefinitionsUsecases";
import { ContactPropertyDefinition } from "../domain/ContactPropertyDefinition";
import {
  ContactPropertyDefinitionsAlreadyExistsError,
  ContactPropertyDefinitionsNotFoundError,
} from "../domain/errors";

export const PrismaContactPropertyDefinitionsRepository = Layer.effect(
  ContactPropertyDefinitionsRepo,
  Effect.gen(function* () {
    const prisma = yield* PrismaService;

    const list = Effect.fn("PrismaContactPropertyDefinitionsRepository.list")(
      function* (scope: { workspaceId: WorkspaceId; spaceId?: SpaceId }) {
        const definitions = yield* prisma.contactPropertyDefinition
          .findMany({
            where: {
              workspaceId: scope.workspaceId,
              spaceId: scope.spaceId ?? null,
            },
          })
          .pipe(Effect.orDie);

        return yield* Schema.decodeUnknownEffect(
          Schema.Array(ContactPropertyDefinition),
        )(definitions).pipe(Effect.orDie);
      },
    );

    const create = Effect.fn(
      "PrismaContactPropertyDefinitionsRepository.create",
    )(function* (input: ContactPropertyDefinitionCreateInput) {
      const definition = yield* prisma.contactPropertyDefinition
        .create({
          data: {
            key: input.key,
            type: input.type,
            isUnique: input.isUnique ?? false,
            workspaceId: input.workspaceId,
            spaceId: input.spaceId ?? null,
          },
        })
        .pipe(
          Effect.catch((error) =>
            error instanceof PrismaClientKnownRequestError &&
            error.code === "P2002"
              ? Effect.fail(new ContactPropertyDefinitionsAlreadyExistsError())
              : Effect.die(error),
          ),
        );

      return yield* Schema.decodeUnknownEffect(ContactPropertyDefinition)(
        definition,
      ).pipe(Effect.orDie);
    });

    const update = Effect.fn(
      "PrismaContactPropertyDefinitionsRepository.update",
    )(function* (input: ContactPropertyDefinitionUpdateInput) {
      const where = {
        id: input.definitionId,
        workspaceId: input.workspaceId,
        spaceId: input.spaceId ?? null,
      };
      const result = yield* prisma.contactPropertyDefinition
        .updateMany({
          where,
          data: {
            ...(input.key !== undefined && { key: input.key }),
            ...(input.isUnique !== undefined && { isUnique: input.isUnique }),
          },
        })
        .pipe(Effect.orDie);

      if (result.count === 0)
        return yield* Effect.fail(
          new ContactPropertyDefinitionsNotFoundError(),
        );

      const definition = yield* prisma.contactPropertyDefinition
        .findFirst({ where })
        .pipe(Effect.orDie);

      if (!definition)
        return yield* Effect.fail(
          new ContactPropertyDefinitionsNotFoundError(),
        );

      return yield* Schema.decodeUnknownEffect(ContactPropertyDefinition)(
        definition,
      ).pipe(Effect.orDie);
    });

    const delete_ = Effect.fn(
      "PrismaContactPropertyDefinitionsRepository.delete",
    )(function* (input: ContactPropertyDefinitionDeleteInput) {
      const result = yield* prisma.contactPropertyDefinition
        .deleteMany({
          where: {
            id: input.definitionId,
            workspaceId: input.workspaceId,
            spaceId: input.spaceId ?? null,
          },
        })
        .pipe(Effect.orDie);

      if (result.count === 0)
        return yield* Effect.fail(
          new ContactPropertyDefinitionsNotFoundError(),
        );
    });

    return ContactPropertyDefinitionsRepo.of({
      list,
      create,
      update,
      delete: delete_,
    });
  }),
);
