import { PrismaClient, WorkspaceInvitation } from 'db'

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
    }),
    p.workspaceInvitation.deleteMany({
      where: {
        email,
      },
    }),
  ])
}
