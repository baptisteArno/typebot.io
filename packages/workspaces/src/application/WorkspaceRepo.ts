import type { UserId, WorkspaceId } from "@typebot.io/shared-core/domain";
import { type Effect, ServiceMap } from "effect";

export class WorkspaceRepo extends ServiceMap.Service<
  WorkspaceRepo,
  {
    readonly isMember: (
      workspaceId: WorkspaceId,
      userId: UserId,
    ) => Effect.Effect<boolean>;
    readonly isAdmin: (
      workspaceId: WorkspaceId,
      userId: UserId,
    ) => Effect.Effect<boolean>;
  }
>()("@typebot.io/WorkspaceRepo") {}
