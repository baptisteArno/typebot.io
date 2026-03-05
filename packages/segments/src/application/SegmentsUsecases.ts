import type { Name, SpaceId } from "@typebot.io/domain-primitives/schemas";
import type { UserId } from "@typebot.io/user/schemas";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Context, Effect, Layer } from "effect";
import type { Segment } from "../core/Segment";
import {
  type AlreadyExistsError,
  ForbiddenError,
} from "../core/SegmentsErrors";
import { SegmentsAuthorization } from "./SegmentsAuthorization";
import { SegmentsRepo } from "./SegmentsRepo";

export class SegmentsUsecases extends Context.Tag(
  "@typebot.io/SegmentsUsecases",
)<
  SegmentsUsecases,
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
    SegmentsUsecases,
    Effect.gen(function* () {
      const segmentsRepo = yield* SegmentsRepo;
      const segmentsAuthorization = yield* SegmentsAuthorization;

      const list = Effect.fn("SegmentsUsecases.list")(function* ({
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
        input: { name: Name },
      ) {
        const canCreate = yield* segmentsAuthorization.canWriteSegments(
          workspaceId,
          userId,
        );

        if (!canCreate) return yield* new ForbiddenError();

        return yield* segmentsRepo.create(workspaceId, spaceId, input);
      });

      return SegmentsUsecases.of({
        list,
        create,
      });
    }),
  );
}
