import { PrismaService } from "@typebot.io/prisma/effect";
import type { UserId, WorkspaceId } from "@typebot.io/shared-core/domain";
import { Effect, Layer } from "effect";
import { WorkspaceRepo } from "../application/WorkspaceRepo";

export const PrismaWorkspaceRepo = Layer.effect(
  WorkspaceRepo,
  Effect.gen(function* () {
    const prisma = yield* PrismaService;

    const isMember = Effect.fn("PrismaWorkspaceRepository.isMember")(function* (
      workspaceId: WorkspaceId,
      userId: UserId,
    ) {
      const totalWorkspaces = yield* prisma.workspace
        .count({
          where: {
            id: workspaceId,
            members: { some: { userId } },
          },
        })
        .pipe(Effect.orDie);

      return totalWorkspaces > 0;
    });

    const isAdmin = Effect.fn("PrismaWorkspaceRepository.isAdmin")(function* (
      workspaceId: WorkspaceId,
      userId: UserId,
    ) {
      const totalWorkspaces = yield* prisma.workspace
        .count({
          where: {
            id: workspaceId,
            members: { some: { userId, role: "ADMIN" } },
          },
        })
        .pipe(Effect.orDie);

      return totalWorkspaces > 0;
    });

    return WorkspaceRepo.of({
      isMember,
      isAdmin,
    });
  }),
);
