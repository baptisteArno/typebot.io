import type { UserId, WorkspaceId } from "@typebot.io/shared-core/domain";
import { Effect, Layer, ServiceMap } from "effect";
import { WorkspaceRepo } from "./WorkspaceRepo";

export class WorkspaceAccessPolicies extends ServiceMap.Service<
  WorkspaceAccessPolicies,
  {
    readonly canRead: (
      workspaceId: WorkspaceId,
      userId: UserId,
    ) => Effect.Effect<boolean>;
    readonly canWrite: (
      workspaceId: WorkspaceId,
      userId: UserId,
    ) => Effect.Effect<boolean>;
  }
>()("@typebot.io/WorkspaceAccessPolicies") {
  static readonly layer = Layer.effect(
    WorkspaceAccessPolicies,
    Effect.gen(function* () {
      const workspaceRepo = yield* WorkspaceRepo;

      const canRead = Effect.fn("WorkspaceAccessPolicies.canRead")(function* (
        workspaceId: WorkspaceId,
        userId: UserId,
      ) {
        const isMember = yield* workspaceRepo.isMember(workspaceId, userId);
        return isMember;
      });

      const canWrite = Effect.fn("WorkspaceAccessPolicies.canWrite")(function* (
        workspaceId: WorkspaceId,
        userId: UserId,
      ) {
        const isAdmin = yield* workspaceRepo.isAdmin(workspaceId, userId);
        return isAdmin;
      });

      return WorkspaceAccessPolicies.of({
        canRead,
        canWrite,
      });
    }),
  );
}
