import type { UserId } from "@typebot.io/user/schemas";
import { WorkspaceRepo } from "@typebot.io/workspaces/application/WorkspaceRepo";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Layer, ServiceMap } from "effect";
import {
  type SpacesAlreadyExistsError,
  SpacesForbiddenError,
} from "../domain/errors";
import type { Space } from "../domain/Space";
import type { SpaceCreateInput } from "./SpaceCreateInput";
import { SpacesRepo } from "./SpacesRepo";

export class SpacesUsecases extends ServiceMap.Service<
  SpacesUsecases,
  {
    readonly create: (
      resource: {
        workspaceId: WorkspaceId;
        userId: UserId;
      },
      input: SpaceCreateInput,
    ) => Effect.Effect<Space, SpacesAlreadyExistsError | SpacesForbiddenError>;
    readonly list: (resource: {
      workspaceId: WorkspaceId;
      userId: UserId;
    }) => Effect.Effect<readonly Space[], SpacesForbiddenError>;
  }
>()("@typebot.io/SpacesUsecases") {
  static readonly layer = Layer.effect(
    SpacesUsecases,
    Effect.gen(function* () {
      const spacesRepo = yield* SpacesRepo;
      const workspaceRepo = yield* WorkspaceRepo;

      const list = Effect.fn("SpacesUsecases.list")(function* ({
        workspaceId,
        userId,
      }: {
        workspaceId: WorkspaceId;
        userId: UserId;
      }): Effect.fn.Return<readonly Space[], SpacesForbiddenError> {
        const canList = yield* workspaceRepo.canReadWorkspace(
          workspaceId,
          userId,
        );

        if (!canList) return yield* new SpacesForbiddenError();

        return yield* spacesRepo.listByWorkspaceId(workspaceId);
      });

      const create = Effect.fn("SpacesUsecases.create")(function* (
        {
          workspaceId,
          userId,
        }: {
          workspaceId: WorkspaceId;
          userId: UserId;
        },
        input: SpaceCreateInput,
      ): Effect.fn.Return<
        Space,
        SpacesAlreadyExistsError | SpacesForbiddenError
      > {
        const canCreate = yield* workspaceRepo.canAdminWriteWorkspace(
          workspaceId,
          userId,
        );

        if (!canCreate) return yield* new SpacesForbiddenError();

        return yield* spacesRepo.create(workspaceId, input);
      });

      return SpacesUsecases.of({
        list,
        create,
      });
    }),
  );
}
