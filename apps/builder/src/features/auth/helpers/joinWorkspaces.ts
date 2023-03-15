import { PrismaClient, WorkspaceInvitation } from '@typebot.io/prisma'

export const joinWorkspaces = async (
  p: PrismaClient,
  { id, email }: { id: string; email: string },
  invitations: WorkspaceInvitation[]
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
  ])
}
