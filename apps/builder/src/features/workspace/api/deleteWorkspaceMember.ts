import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import prisma from "@typebot.io/prisma";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import { z } from "@typebot.io/zod";

export const deleteWorkspaceMember = authenticatedProcedure
  .input(
    z.object({
      workspaceId: z.string(),
      memberId: z.string(),
    }),
  )
  .handler(async ({ input: { workspaceId, memberId }, context: { user } }) => {
    const member = await prisma.memberInWorkspace.deleteMany({
      where: {
        userId: memberId,
        workspace: {
          id: workspaceId,
          members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
        },
      },
    });
    return { member };
  });
