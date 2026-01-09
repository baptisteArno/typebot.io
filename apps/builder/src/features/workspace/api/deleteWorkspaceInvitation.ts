import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import prisma from "@typebot.io/prisma";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import { z } from "@typebot.io/zod";

export const deleteWorkspaceInvitation = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .handler(async ({ input: { id }, context: { user } }) => {
    await prisma.workspaceInvitation.deleteMany({
      where: {
        id,
        workspace: {
          members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
        },
      },
    });
    return { message: "success" };
  });
