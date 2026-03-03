import type { Name, SpaceId } from "@typebot.io/domain-primitives/schemas";
import type { UserId } from "@typebot.io/user/schemas";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Context, Effect, Layer } from "effect";
import type { Segment } from "./Segment";
import { SegmentsAuthorization } from "./SegmentsAuthorization";
import { type AlreadyExistsError, ForbiddenError } from "./SegmentsErrors";
import { SegmentsRepository } from "./SegmentsRepository";

export class Segments extends Context.Tag("@typebot.io/Segments")<
  Segments,
  {
    readonly list: (ressource: {
      workspaceId: WorkspaceId;
      spaceId?: SpaceId;
      userId: UserId;
    }) => Effect.Effect<readonly Segment[], ForbiddenError>;
    readonly create: (
      ressource: {
        workspaceId: WorkspaceId;
        spaceId?: SpaceId;
        userId: UserId;
      },
      input: { name: Name },
    ) => Effect.Effect<Segment, AlreadyExistsError | ForbiddenError>;
  }
>() {
  static readonly layer = Layer.effect(
    Segments,
    Effect.gen(function* () {
      const segmentsRepository = yield* SegmentsRepository;
      const segmentsAuthorization = yield* SegmentsAuthorization;

      const list = Effect.fn("Segments.list")(function* ({
        workspaceId,
        spaceId,
        userId,
      }: {
        workspaceId: WorkspaceId;
        spaceId?: SpaceId;
        userId: UserId;
      }) {
        const canList = yield* segmentsAuthorization.canReadSegments(
          workspaceId,
          userId,
        );

        if (!canList) return yield* new ForbiddenError();

        return yield* segmentsRepository.listByWorkspaceAndSpace(
          workspaceId,
          spaceId,
        );
      });

      const create = Effect.fn("Segments.create")(function* (
        {
          workspaceId,
          spaceId,
          userId,
        }: {
          workspaceId: WorkspaceId;
          spaceId?: SpaceId;
          userId: UserId;
        },
        input: { name: Name },
      ) {
        const canCreate = yield* segmentsAuthorization.canWriteSegments(
          workspaceId,
          userId,
        );

        if (!canCreate) return yield* new ForbiddenError();

        return yield* segmentsRepository.create(workspaceId, spaceId, input);
      });

      return Segments.of({
        list,
        create,
      });
    }),
  );
}
