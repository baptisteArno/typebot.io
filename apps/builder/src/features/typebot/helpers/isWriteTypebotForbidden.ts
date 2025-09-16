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
  } & {
    workspace: Pick<Workspace, 'isSuspended' | 'isPastDue'> & {
      members: Pick<MemberInWorkspace, 'userId' | 'role'>[]
    }
  },
  user: Pick<User, 'id'>
) => {
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
