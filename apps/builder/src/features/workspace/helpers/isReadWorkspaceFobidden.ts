import { env } from '@typebot.io/env'
import { MemberInWorkspace, User } from '@typebot.io/prisma'
import { checkCognitoWorkspaceAccess } from './cognitoUtils'

export const isReadWorkspaceFobidden = (
  workspace: {
    members: Pick<MemberInWorkspace, 'userId'>[]
    id?: string
  },
  user: Pick<User, 'email' | 'id'> & { cognitoClaims?: unknown }
) => {
  // Admin email check (highest priority)
  if (env.ADMIN_EMAIL?.some((email) => email === user.email)) {
    return false
  }

  // Primary: Check Cognito token claims if workspace ID is available
  const cognitoAccess = checkCognitoWorkspaceAccess(user, workspace.id)
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
