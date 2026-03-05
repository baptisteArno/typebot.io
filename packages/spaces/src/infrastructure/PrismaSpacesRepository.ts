import type { Name } from "@typebot.io/domain-primitives/schemas";
import { PrismaService } from "@typebot.io/prisma/effect";
import { PrismaClientKnownRequestError } from "@typebot.io/prisma/enum";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Layer, Schema } from "effect";
import { SpacesRepo } from "../application/SpacesRepo";
import type { SpaceIcon } from "../core/Space";
import { Space } from "../core/Space";
import { AlreadyExistsError } from "../core/SpacesErrors";

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

      return yield* Schema.decodeUnknown(Schema.Array(Space))(spaces).pipe(
        Effect.orDie,
      );
    });

    const create = Effect.fn("PrismaSpacesRepository.create")(function* (
      workspaceId: WorkspaceId,
      input: {
        name: Name;
        icon?: SpaceIcon;
      },
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
          Effect.catchAll((error) =>
            error instanceof PrismaClientKnownRequestError &&
            error.code === "P2002"
              ? new AlreadyExistsError()
              : Effect.die(error),
          ),
        );

      return yield* Schema.decodeUnknown(Space)(space).pipe(Effect.orDie);
    });

    return SpacesRepo.of({
      listByWorkspaceId,
      create,
    });
  }),
);
