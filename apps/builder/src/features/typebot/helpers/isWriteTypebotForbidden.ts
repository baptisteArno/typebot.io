import {
  CollaborationType,
  CollaboratorsOnTypebots,
  MemberInWorkspace,
  User,
  Workspace,
} from '@typebot.io/prisma'
import {
  extractCognitoUserClaims,
  hasWorkspaceAccess,
} from '@/features/workspace/helpers/cognitoUtils'

export const isWriteTypebotForbidden = async (
  typebot: {
    collaborators: Pick<CollaboratorsOnTypebots, 'userId' | 'type'>[]
  } & {
    workspace: Pick<Workspace, 'isSuspended' | 'isPastDue' | 'name'> & {
      members: Pick<MemberInWorkspace, 'userId' | 'role'>[]
    }
  },
  user: Pick<User, 'id' | 'email'> & { cognitoClaims?: unknown }
) => {
  if (typebot.workspace.isSuspended || typebot.workspace.isPastDue) {
    return true
  }

  // Check if user is a collaborator with write access
  const hasWriteCollaboration = typebot.collaborators.some(
    (collaborator) =>
      collaborator.userId === user.id &&
      collaborator.type === CollaborationType.WRITE
  )

  if (hasWriteCollaboration) {
    return false
  }

  // Check if user is a database member with non-guest access
  const isDatabaseMember = typebot.workspace.members.some(
    (m) => m.userId === user.id && m.role !== 'GUEST'
  )

  if (isDatabaseMember) {
    return false
  }

  // Check for Cognito-based workspace access
  if (user.cognitoClaims && typebot.workspace.name) {
    const cognitoClaims = extractCognitoUserClaims(user)

    if (
      cognitoClaims &&
      hasWorkspaceAccess(cognitoClaims, typebot.workspace.name)
    ) {
      // User has Cognito-based access to this workspace, grant write access
      return false
    }
  }

  // No access found
  return true
}
