import type { Name, SpaceId } from "@typebot.io/domain-primitives/schemas";
import { PrismaService } from "@typebot.io/prisma/effect";
import { PrismaClientKnownRequestError } from "@typebot.io/prisma/enum";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Layer, Schema } from "effect";
import { Segment } from "../core/Segment";
import { AlreadyExistsError } from "../core/SegmentsErrors";
import { SegmentsRepository } from "../core/SegmentsRepository";

export const PrismaSegmentsRepository = Layer.effect(
  SegmentsRepository,
  Effect.gen(function* () {
    const prisma = yield* PrismaService;

    const listByWorkspaceAndSpace = Effect.fn(
      "PrismaSegmentsRepository.listByWorkspaceAndSpace",
    )(function* (workspaceId: WorkspaceId, spaceId: SpaceId | undefined) {
      const segments = yield* prisma.segment
        .findMany({
          where: {
            workspaceId,
            spaceId: spaceId ?? null,
          },
        })
        .pipe(Effect.orDie);

      return yield* Schema.decodeUnknown(Schema.Array(Segment))(segments).pipe(
        Effect.orDie,
      );
    });

    const create = Effect.fn("PrismaSegmentsRepository.create")(function* (
      workspaceId: WorkspaceId,
      spaceId: SpaceId | undefined,
      input: { name: Name },
    ) {
      const segment = yield* prisma.segment
        .create({
          data: {
            name: input.name,
            workspaceId,
            spaceId: spaceId ?? null,
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

      return yield* Schema.decodeUnknown(Segment)(segment).pipe(Effect.orDie);
    });

    return SegmentsRepository.of({
      listByWorkspaceAndSpace,
      create,
    });
  }),
);
