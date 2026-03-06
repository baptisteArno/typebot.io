import { PrismaService } from "@typebot.io/prisma/effect";
import { PrismaClientKnownRequestError } from "@typebot.io/prisma/enum";
import type { SpaceId } from "@typebot.io/shared-primitives/domain";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Layer, Schema } from "effect";
import type { SegmentCreateInput } from "../application/SegmentCreateInput";
import { SegmentsRepo } from "../application/SegmentsRepo";
import { SegmentsAlreadyExistsError } from "../domain/errors";
import { Segment } from "../domain/Segment";

export const PrismaSegmentsRepository = Layer.effect(
  SegmentsRepo,
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

      return yield* Schema.decodeUnknownEffect(Schema.Array(Segment))(
        segments,
      ).pipe(Effect.orDie);
    });

    const create = Effect.fn("PrismaSegmentsRepository.create")(function* (
      workspaceId: WorkspaceId,
      spaceId: SpaceId | undefined,
      input: SegmentCreateInput,
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
          Effect.catch((error) =>
            error instanceof PrismaClientKnownRequestError &&
            error.code === "P2002"
              ? Effect.fail(new SegmentsAlreadyExistsError())
              : Effect.die(error),
          ),
        );

      return yield* Schema.decodeUnknownEffect(Segment)(segment).pipe(
        Effect.orDie,
      );
    });

    return SegmentsRepo.of({
      listByWorkspaceAndSpace,
      create,
    });
  }),
);
