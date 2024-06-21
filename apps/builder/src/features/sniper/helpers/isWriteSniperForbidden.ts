import {
  CollaborationType,
  CollaboratorsOnSnipers,
  MemberInWorkspace,
  User,
  Workspace,
} from '@sniper.io/prisma'

export const isWriteSniperForbidden = async (
  sniper: {
    collaborators: Pick<CollaboratorsOnSnipers, 'userId' | 'type'>[]
  } & {
    workspace: Pick<Workspace, 'isSuspended' | 'isPastDue'> & {
      members: Pick<MemberInWorkspace, 'userId' | 'role'>[]
    }
  },
  user: Pick<User, 'id'>
) => {
  return (
    sniper.workspace.isSuspended ||
    sniper.workspace.isPastDue ||
    (!sniper.collaborators.some(
      (collaborator) =>
        collaborator.userId === user.id &&
        collaborator.type === CollaborationType.WRITE
    ) &&
      !sniper.workspace.members.some(
        (m) => m.userId === user.id && m.role !== 'GUEST'
      ))
  )
}
