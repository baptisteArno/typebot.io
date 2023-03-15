import { Invitation, PrismaClient, WorkspaceRole } from '@typebot.io/prisma'

export type InvitationWithWorkspaceId = Invitation & {
  typebot: {
    workspaceId: string | null
  }
}

export const convertInvitationsToCollaborations = async (
  p: PrismaClient,
  { id, email }: { id: string; email: string },
  invitations: InvitationWithWorkspaceId[]
) => {
  await p.collaboratorsOnTypebots.createMany({
    data: invitations.map((invitation) => ({
      typebotId: invitation.typebotId,
      type: invitation.type,
      userId: id,
    })),
  })
  const workspaceInvitations = invitations.reduce<InvitationWithWorkspaceId[]>(
    (acc, invitation) =>
      acc.some(
        (inv) => inv.typebot.workspaceId === invitation.typebot.workspaceId
      )
        ? acc
        : [...acc, invitation],
    []
  )
  for (const invitation of workspaceInvitations) {
    if (!invitation.typebot.workspaceId) continue
    await p.memberInWorkspace.createMany({
      data: [
        {
          userId: id,
          workspaceId: invitation.typebot.workspaceId,
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
