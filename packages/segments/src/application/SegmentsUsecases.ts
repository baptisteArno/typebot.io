import type { SpaceId } from "@typebot.io/shared-primitives/domain";
import type { UserId } from "@typebot.io/user/schemas";
import { WorkspaceRepo } from "@typebot.io/workspaces/application/WorkspaceRepo";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Layer, ServiceMap } from "effect";
import {
  type SegmentsAlreadyExistsError,
  SegmentsForbiddenError,
} from "../domain/errors";
import type { Segment } from "../domain/Segment";
import type { SegmentCreateInput } from "./SegmentCreateInput";
import { SegmentsRepo } from "./SegmentsRepo";

export class SegmentsUsecases extends ServiceMap.Service<
  SegmentsUsecases,
  {
    readonly list: (ressource: {
      workspaceId: WorkspaceId;
      spaceId?: SpaceId;
      userId: UserId;
    }) => Effect.Effect<readonly Segment[], SegmentsForbiddenError>;
    readonly create: (
      ressource: {
        workspaceId: WorkspaceId;
        spaceId?: SpaceId;
        userId: UserId;
      },
      input: SegmentCreateInput,
    ) => Effect.Effect<
      Segment,
      SegmentsAlreadyExistsError | SegmentsForbiddenError
    >;
  }
>()("@typebot.io/SegmentsUsecases") {
  static readonly layer = Layer.effect(
    SegmentsUsecases,
    Effect.gen(function* () {
      const segmentsRepo = yield* SegmentsRepo;
      const workspaceRepo = yield* WorkspaceRepo;

      const list = Effect.fn("SegmentsUsecases.list")(function* ({
        workspaceId,
        spaceId,
        userId,
      }: {
        workspaceId: WorkspaceId;
        spaceId?: SpaceId;
        userId: UserId;
      }): Effect.fn.Return<readonly Segment[], SegmentsForbiddenError> {
        const canList = yield* workspaceRepo.canReadWorkspace(
          workspaceId,
          userId,
        );

        if (!canList) return yield* new SegmentsForbiddenError();

        return yield* segmentsRepo.listByWorkspaceAndSpace(
          workspaceId,
          spaceId,
        );
      });

      const create = Effect.fn("SegmentsUsecases.create")(function* (
        {
          workspaceId,
          spaceId,
          userId,
        }: {
          workspaceId: WorkspaceId;
          spaceId?: SpaceId;
          userId: UserId;
        },
        input: SegmentCreateInput,
      ): Effect.fn.Return<
        Segment,
        SegmentsAlreadyExistsError | SegmentsForbiddenError
      > {
        const canCreate = yield* workspaceRepo.canAdminWriteWorkspace(
          workspaceId,
          userId,
        );

        if (!canCreate) return yield* new SegmentsForbiddenError();

        return yield* segmentsRepo.create(workspaceId, spaceId, input);
      });

      return SegmentsUsecases.of({
        list,
        create,
      });
    }),
  );
}
