import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Context, type Effect } from "effect";
import type { SpacesAlreadyExistsError } from "../domain/errors";
import type { Space } from "../domain/Space";
import type { SpaceCreateInput } from "./SpaceCreateInput";

export class SpacesRepo extends Context.Tag("@typebot.io/SpacesRepo")<
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
>() {}
