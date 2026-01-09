import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import prisma from "@typebot.io/prisma";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import { z } from "@typebot.io/zod";

export const updateWorkspaceInvitation = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
      email: z.string().optional(),
      type: z.nativeEnum(WorkspaceRole).optional(),
      workspaceId: z.string().optional(),
    }),
  )
  .handler(async ({ input, context: { user } }) => {
    const invitation = await prisma.workspaceInvitation.updateMany({
      where: {
        id: input.id,
        workspace: {
          members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
        },
      },
      data: input,
    });
    return { invitation };
  });
