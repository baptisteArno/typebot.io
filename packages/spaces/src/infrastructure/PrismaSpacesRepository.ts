import { PrismaService } from "@typebot.io/prisma/effect";
import { PrismaClientKnownRequestError } from "@typebot.io/prisma/enum";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Layer, Schema } from "effect";
import type { SpaceCreateInput } from "../application/SpaceCreateInput";
import { SpacesRepo } from "../application/SpacesRepo";
import { SpacesAlreadyExistsError } from "../domain/errors";
import { Space } from "../domain/Space";

export const PrismaSpacesRepository = Layer.effect(
  SpacesRepo,
  Effect.gen(function* () {
    const prisma = yield* PrismaService;

    const listByWorkspaceId = Effect.fn(
      "PrismaSpacesRepository.listByWorkspaceId",
    )(function* (workspaceId: WorkspaceId) {
      const spaces = yield* prisma.space
        .findMany({
          where: {
            workspaceId,
          },
          orderBy: {
            createdAt: "desc",
          },
        })
        .pipe(Effect.orDie);

      return yield* Schema.decodeUnknownEffect(Schema.Array(Space))(
        spaces,
      ).pipe(Effect.orDie);
    });

    const create = Effect.fn("PrismaSpacesRepository.create")(function* (
      workspaceId: WorkspaceId,
      input: SpaceCreateInput,
    ) {
      const space = yield* prisma.space
        .create({
          data: {
            name: input.name,
            icon: input.icon,
            workspaceId,
          },
        })
        .pipe(
          Effect.catch((error) =>
            error instanceof PrismaClientKnownRequestError &&
            error.code === "P2002"
              ? Effect.fail(new SpacesAlreadyExistsError())
              : Effect.die(error),
          ),
        );

      return yield* Schema.decodeUnknownEffect(Space)(space).pipe(Effect.orDie);
    });

    return SpacesRepo.of({
      listByWorkspaceId,
      create,
    });
  }),
);
