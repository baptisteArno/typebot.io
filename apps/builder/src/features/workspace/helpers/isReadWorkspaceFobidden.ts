import { env } from '@typebot.io/env'
import { MemberInWorkspace, User } from '@typebot.io/prisma'
import { checkCognitoWorkspaceAccess } from './cognitoUtils'

export const isReadWorkspaceFobidden = (
  workspace: {
    members: Pick<MemberInWorkspace, 'userId'>[]
    name?: string
  },
  user: Pick<User, 'email' | 'id'> & { cognitoClaims?: unknown }
) => {
  // Admin email check (highest priority)
  if (env.ADMIN_EMAIL?.some((email) => email === user.email)) {
    return false
  }

  // Primary: Check Cognito token claims if workspace name is available
  const cognitoAccess = checkCognitoWorkspaceAccess(user, workspace.name)
  if (cognitoAccess.hasAccess) {
    return false
  }

  // Fallback: Check database members
  const dbMember = workspace.members.find((member) => member.userId === user.id)

  if (dbMember) {
    return false
  }

  return true
}
