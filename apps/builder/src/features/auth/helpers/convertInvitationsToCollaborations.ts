import { Invitation, PrismaClient, WorkspaceRole } from '@sniper.io/prisma'

export type InvitationWithWorkspaceId = Invitation & {
  sniper: {
    workspaceId: string | null
  }
}

export const convertInvitationsToCollaborations = async (
  p: PrismaClient,
  { id, email }: { id: string; email: string },
  invitations: InvitationWithWorkspaceId[]
) => {
  await p.collaboratorsOnSnipers.createMany({
    data: invitations.map((invitation) => ({
      sniperId: invitation.sniperId,
      type: invitation.type,
      userId: id,
    })),
  })
  const workspaceInvitations = invitations.reduce<InvitationWithWorkspaceId[]>(
    (acc, invitation) =>
      acc.some(
        (inv) => inv.sniper.workspaceId === invitation.sniper.workspaceId
      )
        ? acc
        : [...acc, invitation],
    []
  )
  for (const invitation of workspaceInvitations) {
    if (!invitation.sniper.workspaceId) continue
    await p.memberInWorkspace.createMany({
      data: [
        {
          userId: id,
          workspaceId: invitation.sniper.workspaceId,
          role: WorkspaceRole.GUEST,
        },
      ],
      skipDuplicates: true,
    })
  }
  return p.invitation.deleteMany({
    where: {
      email,
    },
  })
}
