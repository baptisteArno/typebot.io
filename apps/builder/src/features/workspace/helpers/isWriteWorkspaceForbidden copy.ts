import { MemberInWorkspace, User } from '@typebot.io/prisma'

export const isWriteWorkspaceForbidden = (
  workspace: {
    members: MemberInWorkspace[]
  },
  user: Pick<User, 'email' | 'id'>
) => {
  const userRole = workspace.members.find(
    (member) => member.userId === user.id
  )?.role
  return !userRole || userRole === 'GUEST'
}
