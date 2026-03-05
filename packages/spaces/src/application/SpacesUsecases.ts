import type { Name } from "@typebot.io/domain/shared-primitives";
import type { UserId } from "@typebot.io/user/schemas";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Context, Effect, Layer } from "effect";
import type { Space, SpaceIcon } from "../core/Space";
import { type AlreadyExistsError, ForbiddenError } from "../core/SpacesErrors";
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
      input: {
        name: Name;
        icon?: SpaceIcon;
      },
    ) => Effect.Effect<Space, AlreadyExistsError | ForbiddenError>;
    readonly list: (resource: {
      workspaceId: WorkspaceId;
      userId: UserId;
    }) => Effect.Effect<readonly Space[], ForbiddenError>;
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

        if (!canList) return yield* new ForbiddenError();

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
        input: {
          name: Name;
          icon?: SpaceIcon;
        },
      ) {
        const canCreate = yield* spacesAuthorization.canCreateSpace(
          workspaceId,
          userId,
        );

        if (!canCreate) return yield* new ForbiddenError();

        return yield* spacesRepo.create(workspaceId, input);
      });

      return SpacesUsecases.of({
        list,
        create,
      });
    }),
  );
}
