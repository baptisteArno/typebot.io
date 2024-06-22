import { env } from '@sniper.io/env'
import { MemberInWorkspace, User } from '@sniper.io/prisma'

export const isReadWorkspaceFobidden = (
  workspace: {
    members: Pick<MemberInWorkspace, 'userId'>[]
  },
  user: Pick<User, 'email' | 'id'>
) => {
  if (
    env.ADMIN_EMAIL?.some((email) => email === user.email) ||
    workspace.members.find((member) => member.userId === user.id)
  )
    return false
  return true
}
