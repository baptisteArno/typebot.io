import { MemberInWorkspace, User } from '@typebot.io/prisma'

export const isWriteWorkspaceForbidden = (
  workspace: {
    members: Pick<MemberInWorkspace, 'userId' | 'role'>[]
  },
  user: Pick<User, 'id'>
) => {
  const userRole = workspace.members.find(
    (member) => member.userId === user.id
  )?.role
  return !userRole || userRole === 'GUEST'
}
