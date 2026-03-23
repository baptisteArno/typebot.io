import { MemberInWorkspace, User, WorkspaceRole } from '@typebot.io/prisma'
import { extractCognitoUserClaims, hasWorkspaceAccess } from './cognitoUtils'

export const isWriteWorkspaceForbidden = (
  workspace: {
    members: Pick<MemberInWorkspace, 'userId' | 'role'>[]
    id?: string
  },
  user: Pick<User, 'id'> & { cognitoClaims?: unknown }
) => {
  // Primary: Check Cognito token claims if workspace ID is available
  if (workspace.id && user.cognitoClaims) {
    const cognitoClaims = extractCognitoUserClaims(user)
    if (cognitoClaims && hasWorkspaceAccess(cognitoClaims, workspace.id)) {
      // User has workspace access - check their role level
      if (cognitoClaims['custom:hub_role']) {
        // Use the specific hub_role to determine access
        return false // All Cognito roles (ADMIN/MANAGER/CLIENT) have write access
      } else {
        // No hub_role but has workspace access via eddie_workspaces
        // Default to allowing write access
        return false
      }
    }
  }

  // Fallback: Check database members
  const userRole = workspace.members.find(
    (member) => member.userId === user.id
  )?.role
  return !userRole || userRole === WorkspaceRole.GUEST
}
