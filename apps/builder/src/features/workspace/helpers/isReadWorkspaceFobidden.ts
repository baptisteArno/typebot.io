import { MemberInWorkspace, User } from '@typebot.io/prisma'

export const isReadWorkspaceFobidden = async (
  workspace: {
    members: MemberInWorkspace[]
  },
  user: Pick<User, 'email' | 'id'>
) => {
  if (
    process.env.ADMIN_EMAIL === user.email ||
    workspace.members.find((member) => member.userId === user.id)
  )
    return false
  return true
}
