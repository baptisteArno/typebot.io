import type { Name } from "@typebot.io/domain-primitives/schemas";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Context, type Effect } from "effect";
import type { Space, SpaceIcon } from "../core/Space";
import type { AlreadyExistsError } from "../core/SpacesErrors";

export class SpacesRepo extends Context.Tag("@typebot.io/SpacesRepo")<
  SpacesRepo,
  {
    readonly listByWorkspaceId: (
      workspaceId: WorkspaceId,
    ) => Effect.Effect<readonly Space[]>;
    readonly create: (
      workspaceId: WorkspaceId,
      input: {
        name: Name;
        icon?: SpaceIcon;
      },
    ) => Effect.Effect<Space, AlreadyExistsError>;
  }
>() {}
