import { PrismaService } from "@typebot.io/prisma/effect";
import type { UserId } from "@typebot.io/user/schemas";
import { Effect, Layer } from "effect";
import { WorkspaceRepo } from "../application/WorkspaceRepo";
import type { WorkspaceId } from "../schemas";

export const PrismaWorkspaceRepository = Layer.effect(
  WorkspaceRepo,
  Effect.gen(function* () {
    const prisma = yield* PrismaService;

    const canReadWorkspace = Effect.fn(
      "PrismaWorkspaceRepository.canReadWorkspace",
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
      "PrismaWorkspaceRepository.canAdminWriteWorkspace",
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

    return WorkspaceRepo.of({
      canReadWorkspace,
      canAdminWriteWorkspace,
    });
  }),
);
