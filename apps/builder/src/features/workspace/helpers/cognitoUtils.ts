import { WorkspaceRole, User } from '@typebot.io/prisma'
import logger from '@/helpers/logger'

export interface CognitoWorkspaceAccessResult {
  hasAccess: boolean
  role?: WorkspaceRole
  claims?: CognitoUserClaims
}

export interface CognitoUserClaims {
  'custom:hub_role'?: 'ADMIN' | 'CLIENT' | 'MANAGER'
  'custom:eddie_workspaces'?: string
}

export const extractCognitoUserClaims = (
  user: unknown
): CognitoUserClaims | undefined => {
  if (typeof user !== 'object' || user === null) {
    return undefined
  }

  const userObj = user as Record<string, unknown>

  // Check if user has cognitoClaims property
  if (
    !('cognitoClaims' in userObj) ||
    typeof userObj.cognitoClaims !== 'object' ||
    userObj.cognitoClaims === null
  ) {
    return undefined
  }

  const cognitoClaims = userObj.cognitoClaims as Record<string, unknown>

  // Check if user has any relevant Cognito claims
  const hasHubRole =
    'custom:hub_role' in cognitoClaims && cognitoClaims['custom:hub_role']
  const hasEddieWorkspaces =
    'custom:eddie_workspaces' in cognitoClaims &&
    cognitoClaims['custom:eddie_workspaces']

  // User must have at least custom:hub_role or custom:eddie_workspaces to be considered for workspace access
  if (!hasHubRole && !hasEddieWorkspaces) {
    return undefined
  }

  const result: CognitoUserClaims = {}

  if (hasHubRole) {
    result['custom:hub_role'] = cognitoClaims['custom:hub_role'] as
      | 'ADMIN'
      | 'CLIENT'
      | 'MANAGER'
  }

  if (hasEddieWorkspaces) {
    result['custom:eddie_workspaces'] = cognitoClaims[
      'custom:eddie_workspaces'
    ] as string
  }

  return result
}

export const hasWorkspaceAccess = (
  claims: CognitoUserClaims,
  workspaceId: string
): boolean => {
  if (!workspaceId) {
    return false
  }

  if (claims['custom:hub_role'] === 'ADMIN') {
    return true
  }

  if (claims['custom:eddie_workspaces']) {
    const workspacesIds = claims['custom:eddie_workspaces']
      .split(',')
      .map((workspace) => workspace.trim())

    if (workspacesIds.includes(workspaceId)) {
      logger.info('WorkspaceAccess match found via eddie_workspaces', {
        eddieWorkspaces: claims['custom:eddie_workspaces'],
        workspace: workspaceId,
      })
      return true
    }
  }
  return false
}

export const mapCognitoRoleToWorkspaceRole = (
  hubRole: string
): WorkspaceRole => {
  switch (hubRole) {
    case 'ADMIN':
    case 'MANAGER':
      return WorkspaceRole.ADMIN
    case 'CLIENT':
      return WorkspaceRole.MEMBER
    default:
      return WorkspaceRole.GUEST
  }
}

/**
 * Centralized function to check Cognito-based workspace access and return role information.
 * This replaces the duplicated pattern of extracting claims, checking access, and mapping roles.
 */
export const checkCognitoWorkspaceAccess = (
  user: Pick<User, 'email' | 'id'> & { cognitoClaims?: unknown },
  workspaceId?: string
): CognitoWorkspaceAccessResult => {
  if (!workspaceId || !user.cognitoClaims) {
    return { hasAccess: false }
  }

  const cognitoClaims = extractCognitoUserClaims(user)
  if (!cognitoClaims || !hasWorkspaceAccess(cognitoClaims, workspaceId)) {
    return { hasAccess: false }
  }

  const role = cognitoClaims['custom:hub_role']
    ? mapCognitoRoleToWorkspaceRole(cognitoClaims['custom:hub_role'])
    : WorkspaceRole.MEMBER

  return { hasAccess: true, role, claims: cognitoClaims }
}
