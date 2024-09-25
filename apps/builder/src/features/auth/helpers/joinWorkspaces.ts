import type { Prisma } from "@typebot.io/prisma/types";

export const joinWorkspaces = async (
  p: Prisma.PrismaClient,
  { id, email }: { id: string; email: string },
  invitations: Prisma.WorkspaceInvitation[],
) => {
  await p.$transaction([
    p.memberInWorkspace.createMany({
      data: invitations.map((invitation) => ({
        workspaceId: invitation.workspaceId,
        role: invitation.type,
        userId: id,
      })),
      skipDuplicates: true,
    }),
    p.workspaceInvitation.deleteMany({
      where: {
        email,
      },
    }),
  ]);
};
