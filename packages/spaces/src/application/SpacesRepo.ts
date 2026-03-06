import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { type Effect, ServiceMap } from "effect";
import type { SpacesAlreadyExistsError } from "../domain/errors";
import type { Space } from "../domain/Space";
import type { SpaceCreateInput } from "./SpaceCreateInput";

export class SpacesRepo extends ServiceMap.Service<
  SpacesRepo,
  {
    readonly listByWorkspaceId: (
      workspaceId: WorkspaceId,
    ) => Effect.Effect<readonly Space[]>;
    readonly create: (
      workspaceId: WorkspaceId,
      input: SpaceCreateInput,
    ) => Effect.Effect<Space, SpacesAlreadyExistsError>;
  }
>()("@typebot.io/SpacesRepo") {}
