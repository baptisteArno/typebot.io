import type { UserId } from "@typebot.io/user/schemas";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Context, type Effect } from "effect";

export class SpacesAuthorization extends Context.Tag(
  "@typebot.io/SpacesAuthorization",
)<
  SpacesAuthorization,
  {
    readonly canListSpaces: (
      workspaceId: WorkspaceId,
      userId: UserId,
    ) => Effect.Effect<boolean>;
    readonly canCreateSpace: (
      workspaceId: WorkspaceId,
      userId: UserId,
    ) => Effect.Effect<boolean>;
  }
>() {}
