import type { UserId } from "@typebot.io/user/schemas";
import { type Effect, ServiceMap } from "effect";
import type { WorkspaceId } from "../schemas";

export class WorkspaceRepo extends ServiceMap.Service<
  WorkspaceRepo,
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
>()("@typebot.io/WorkspaceRepo") {}
