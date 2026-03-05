import type { UserId } from "@typebot.io/user/schemas";
import { Context, type Effect } from "effect";
import type { WorkspaceId } from "../schemas";

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
