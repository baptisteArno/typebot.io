import { PrismaClient, WorkspaceInvitation } from '@typebot.io/prisma'
import { InvitationWithWorkspaceId } from './convertInvitationsToCollaborations'

export const getNewUserInvitations = async (
  p: PrismaClient,
  email: string
): Promise<{
  invitations: InvitationWithWorkspaceId[]
  workspaceInvitations: WorkspaceInvitation[]
}> => {
  const [invitations, workspaceInvitations] = await p.$transaction([
    p.invitation.findMany({
      where: { email },
      include: { typebot: { select: { workspaceId: true } } },
    }),
    p.workspaceInvitation.findMany({
      where: { email },
    }),
  ])

  return { invitations, workspaceInvitations }
}
