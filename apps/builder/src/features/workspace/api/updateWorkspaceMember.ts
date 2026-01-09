import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import prisma from "@typebot.io/prisma";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import { z } from "@typebot.io/zod";

export const updateWorkspaceMember = authenticatedProcedure
  .input(
    z.object({
      workspaceId: z.string(),
      memberId: z.string(),
      role: z.nativeEnum(WorkspaceRole),
    }),
  )
  .handler(
    async ({ input: { workspaceId, memberId, role }, context: { user } }) => {
      const member = await prisma.memberInWorkspace.updateMany({
        where: {
          userId: memberId,
          workspace: {
            id: workspaceId,
            members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
          },
        },
        data: { role },
      });
      return { member };
    },
  );
