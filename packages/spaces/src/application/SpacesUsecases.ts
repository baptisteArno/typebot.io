import type { UserId } from "@typebot.io/user/schemas";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Context, Effect, Layer } from "effect";
import {
  type SpacesAlreadyExistsError,
  SpacesForbiddenError,
} from "../domain/errors";
import type { Space } from "../domain/Space";
import type { SpaceCreateInput } from "./SpaceCreateInput";
import { SpacesAuthorization } from "./SpacesAuthorization";
import { SpacesRepo } from "./SpacesRepo";

export class SpacesUsecases extends Context.Tag("@typebot.io/SpacesUsecases")<
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
>() {
  static readonly layer = Layer.effect(
    SpacesUsecases,
    Effect.gen(function* () {
      const spacesRepo = yield* SpacesRepo;
      const spacesAuthorization = yield* SpacesAuthorization;

      const list = Effect.fn("SpacesUsecases.list")(function* ({
        workspaceId,
        userId,
      }: {
        workspaceId: WorkspaceId;
        userId: UserId;
      }) {
        const canList = yield* spacesAuthorization.canListSpaces(
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
      ) {
        const canCreate = yield* spacesAuthorization.canCreateSpace(
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
