import {
  CollaborationType,
  CollaboratorsOnTypebots,
  MemberInWorkspace,
  User,
  Workspace,
} from '@typebot.io/prisma'

export const isWriteTypebotForbidden = async (
  typebot: {
    collaborators: Pick<CollaboratorsOnTypebots, 'userId' | 'type'>[]
    isBeingEdited?: boolean | null
    editingUserEmail?: string | null
    editingUserName?: string | null
    editingStartedAt?: Date | null
  } & {
    workspace: Pick<Workspace, 'isSuspended' | 'isPastDue'> & {
      members: Pick<MemberInWorkspace, 'userId' | 'role'>[]
    }
  },
  user: Pick<User, 'id' | 'email'>
) => {
  if (
    typebot.isBeingEdited &&
    typebot.editingUserEmail &&
    typebot.editingUserEmail !== user.email
  ) {
    const fifteenSecondsAgo = new Date(Date.now() - 15000)
    const editingStartedAt = typebot.editingStartedAt

    if (editingStartedAt && editingStartedAt >= fifteenSecondsAgo) {
      return true
    }
  }

  return (
    typebot.workspace.isSuspended ||
    typebot.workspace.isPastDue ||
    (!typebot.collaborators.some(
      (collaborator) =>
        collaborator.userId === user.id &&
        collaborator.type === CollaborationType.WRITE
    ) &&
      !typebot.workspace.members.some(
        (m) => m.userId === user.id && m.role !== 'GUEST'
      ))
  )
}
