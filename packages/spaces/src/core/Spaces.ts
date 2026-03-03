import type { Name } from "@typebot.io/domain-primitives/schemas";
import type { UserId } from "@typebot.io/user/schemas";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Context, Effect, Layer } from "effect";
import type { Space, SpaceIcon } from "./Space";
import { SpacesAuthorization } from "./SpacesAuthorization";
import { type AlreadyExistsError, ForbiddenError } from "./SpacesErrors";
import { SpacesRepository } from "./SpacesRepository";

export class Spaces extends Context.Tag("@typebot.io/Spaces")<
  Spaces,
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
    Spaces,
    Effect.gen(function* () {
      const spacesRepository = yield* SpacesRepository;
      const spacesAuthorization = yield* SpacesAuthorization;

      const list = Effect.fn("Spaces.list")(function* ({
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

        return yield* spacesRepository.listByWorkspaceId(workspaceId);
      });

      const create = Effect.fn("Spaces.create")(function* (
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

        return yield* spacesRepository.create(workspaceId, input);
      });

      return Spaces.of({
        list,
        create,
      });
    }),
  );
}
