import type { UserId } from "@typebot.io/user/schemas";
import { WorkspaceAuthorization } from "@typebot.io/workspaces/core/WorkspaceAuthorization";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Layer } from "effect";
import { AudiencesAuthorization } from "../core/AudiencesAuthorization";

export const PrismaAudiencesAuthorization = Layer.effect(
  AudiencesAuthorization,
  Effect.gen(function* () {
    const workspaceAuthorization = yield* WorkspaceAuthorization;

    const canListAudiences = (workspaceId: WorkspaceId, userId: UserId) =>
      workspaceAuthorization.canReadWorkspace(workspaceId, userId);

    const canCreateAudience = (workspaceId: WorkspaceId, userId: UserId) =>
      workspaceAuthorization.canAdminWriteWorkspace(workspaceId, userId);

    return AudiencesAuthorization.of({
      canListAudiences,
      canCreateAudience,
    });
  }),
);
