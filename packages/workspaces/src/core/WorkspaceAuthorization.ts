import type { UserId } from "@typebot.io/user/schemas";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Context, type Effect } from "effect";

export class WorkspaceAuthorization extends Context.Tag(
  "@typebot.io/WorkspaceAuthorization",
)<
  WorkspaceAuthorization,
  {
    readonly canReadWorkspace: (
      workspaceId: WorkspaceId,
      userId: UserId,
    ) => Effect.Effect<boolean>;
    readonly canAdminWriteWorkspace: (
      workspaceId: WorkspaceId,
      userId: UserId,
    ) => Effect.Effect<boolean>;
  }
>() {}
