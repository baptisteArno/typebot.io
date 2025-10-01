import { MemberInWorkspace, User, WorkspaceRole } from '@typebot.io/prisma'
import { checkCognitoWorkspaceAccess } from './cognitoUtils'

export const isAdminWriteWorkspaceForbidden = (
  workspace: {
    members: Pick<MemberInWorkspace, 'role' | 'userId'>[]
    name?: string
  },
  user: Pick<User, 'email' | 'id'> & { cognitoClaims?: unknown }
) => {
  // Primary: Check Cognito token claims if workspace name is available
  const cognitoAccess = checkCognitoWorkspaceAccess(user, workspace.name)
  if (cognitoAccess.hasAccess) {
    return cognitoAccess.role !== WorkspaceRole.ADMIN
  }

  // Fallback: Check database members
  const userRole = workspace.members.find(
    (member) => member.userId === user.id
  )?.role
  return !userRole || userRole !== WorkspaceRole.ADMIN
}
