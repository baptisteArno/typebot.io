import type { Name, SpaceId } from "@typebot.io/domain-primitives/schemas";
import { PrismaService } from "@typebot.io/prisma/effect";
import { PrismaClientKnownRequestError } from "@typebot.io/prisma/enum";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Layer, Schema } from "effect";
import { Audience } from "../core/Audience";
import { AlreadyExistsError } from "../core/AudiencesErrors";
import { AudiencesRepository } from "../core/AudiencesRepository";

export const PrismaAudiencesRepository = Layer.effect(
  AudiencesRepository,
  Effect.gen(function* () {
    const prisma = yield* PrismaService;

    const listByWorkspaceId = Effect.fn(
      "PrismaAudiencesRepository.listByWorkspaceId",
    )(function* (workspaceId: WorkspaceId) {
      const audiences = yield* prisma.audience
        .findMany({
          where: {
            workspaceId,
          },
          orderBy: {
            createdAt: "desc",
          },
        })
        .pipe(Effect.orDie);

      return yield* Schema.decodeUnknown(Schema.Array(Audience))(
        audiences,
      ).pipe(Effect.orDie);
    });

    const create = Effect.fn("PrismaAudiencesRepository.create")(function* (
      workspaceId: WorkspaceId,
      input: { name: Name; spaceId?: SpaceId },
    ) {
      const audience = yield* prisma.audience
        .create({
          data: {
            workspaceId,
            spaceId: input.spaceId,
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

      return yield* Schema.decodeUnknown(Audience)(audience).pipe(Effect.orDie);
    });

    return AudiencesRepository.of({
      listByWorkspaceId,
      create,
    });
  }),
);
