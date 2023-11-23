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
    workspace: Pick<Workspace, 'isQuarantined' | 'isPastDue'> & {
      members: Pick<MemberInWorkspace, 'userId' | 'role'>[]
    }
  },
  user: Pick<User, 'id'>
) => {
  return (
    typebot.workspace.isQuarantined ||
    typebot.workspace.isPastDue ||
    !(
      typebot.collaborators.find(
        (collaborator) => collaborator.userId === user.id
      )?.type === CollaborationType.WRITE &&
      typebot.workspace.members.some(
        (m) => m.userId === user.id && m.role !== 'GUEST'
      )
    )
  )
}
