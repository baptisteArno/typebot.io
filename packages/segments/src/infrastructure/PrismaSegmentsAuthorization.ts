import type { UserId } from "@typebot.io/user/schemas";
import { WorkspaceAuthorization } from "@typebot.io/workspaces/core/WorkspaceAuthorization";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Layer } from "effect";
import { SegmentsAuthorization } from "../core/SegmentsAuthorization";

export const PrismaSegmentsAuthorization = Layer.effect(
  SegmentsAuthorization,
  Effect.gen(function* () {
    const workspaceAuthorization = yield* WorkspaceAuthorization;

    const canReadSegments = Effect.fn(
      "PrismaSegmentsAuthorization.canReadSegments",
    )(function* (workspaceId: WorkspaceId, userId: UserId) {
      return yield* workspaceAuthorization.canReadWorkspace(
        workspaceId,
        userId,
      );
    });

    const canWriteSegments = Effect.fn(
      "PrismaSegmentsAuthorization.canWriteSegments",
    )(function* (workspaceId: WorkspaceId, userId: UserId) {
      return yield* workspaceAuthorization.canAdminWriteWorkspace(
        workspaceId,
        userId,
      );
    });

    return SegmentsAuthorization.of({
      canReadSegments,
      canWriteSegments,
    });
  }),
);
