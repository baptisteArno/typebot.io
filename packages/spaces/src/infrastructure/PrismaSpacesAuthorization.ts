import type { UserId } from "@typebot.io/user/schemas";
import { WorkspaceAuthorization } from "@typebot.io/workspaces/core/WorkspaceAuthorization";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Layer } from "effect";
import { SpacesAuthorization } from "../application/SpacesAuthorization";

export const PrismaSpacesAuthorization = Layer.effect(
  SpacesAuthorization,
  Effect.gen(function* () {
    const workspaceAuthorization = yield* WorkspaceAuthorization;

    const canListSpaces = (workspaceId: WorkspaceId, userId: UserId) =>
      workspaceAuthorization.canReadWorkspace(workspaceId, userId);

    const canCreateSpace = (workspaceId: WorkspaceId, userId: UserId) =>
      workspaceAuthorization.canAdminWriteWorkspace(workspaceId, userId);

    return SpacesAuthorization.of({
      canListSpaces,
      canCreateSpace,
    });
  }),
);
