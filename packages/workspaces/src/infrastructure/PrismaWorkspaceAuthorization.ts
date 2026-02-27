import { PrismaService } from "@typebot.io/prisma/effect";
import type { UserId } from "@typebot.io/user/schemas";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Layer } from "effect";
import { WorkspaceAuthorization } from "../core/WorkspaceAuthorization";

export const PrismaWorkspaceAuthorization = Layer.effect(
  WorkspaceAuthorization,
  Effect.gen(function* () {
    const prisma = yield* PrismaService;

    const canReadWorkspace = Effect.fn(
      "PrismaWorkspaceAuthorization.canReadWorkspace",
    )(function* (workspaceId: WorkspaceId, userId: UserId) {
      const workspace = yield* prisma.workspace
        .findFirst({
          where: {
            id: workspaceId,
            members: { some: { userId } },
          },
          select: { id: true },
        })
        .pipe(Effect.orDie);

      return workspace !== null;
    });

    const canAdminWriteWorkspace = Effect.fn(
      "PrismaWorkspaceAuthorization.canAdminWriteWorkspace",
    )(function* (workspaceId: WorkspaceId, userId: UserId) {
      const workspace = yield* prisma.workspace
        .findFirst({
          where: {
            id: workspaceId,
            members: { some: { userId, role: "ADMIN" } },
          },
          select: { id: true },
        })
        .pipe(Effect.orDie);

      return workspace !== null;
    });

    return WorkspaceAuthorization.of({
      canReadWorkspace,
      canAdminWriteWorkspace,
    });
  }),
);
