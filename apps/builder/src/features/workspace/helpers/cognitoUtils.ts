import { WorkspaceRole, User } from '@typebot.io/prisma'
import logger from '@/helpers/logger'

export interface CognitoWorkspaceAccessResult {
  hasAccess: boolean
  role?: WorkspaceRole
  claims?: CognitoUserClaims
}

export interface CognitoUserClaims {
  'custom:hub_role'?: 'ADMIN' | 'CLIENT' | 'MANAGER'
  'custom:tenant_id'?: string
  'custom:claudia_projects'?: string
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
  const hasTenantId =
    'custom:tenant_id' in cognitoClaims && cognitoClaims['custom:tenant_id']
  const hasClaudiaProjects =
    'custom:claudia_projects' in cognitoClaims &&
    cognitoClaims['custom:claudia_projects']

  // User must have at least hub_role OR some form of workspace access (tenant_id or claudia_projects)
  if (!hasHubRole && !hasTenantId && !hasClaudiaProjects) {
    return undefined
  }

  const result: CognitoUserClaims = {}

  if (hasHubRole) {
    result['custom:hub_role'] = cognitoClaims['custom:hub_role'] as
      | 'ADMIN'
      | 'CLIENT'
      | 'MANAGER'
  }

  if (hasTenantId) {
    result['custom:tenant_id'] = cognitoClaims['custom:tenant_id'] as string
  }

  if (hasClaudiaProjects) {
    result['custom:claudia_projects'] = cognitoClaims[
      'custom:claudia_projects'
    ] as string
  }

  return result
}

export const getUserWorkspaceNameFromCognito = (
  claims: CognitoUserClaims
): string | undefined => {
  return claims['custom:tenant_id'] || undefined
}

export const hasWorkspaceAccess = (
  claims: CognitoUserClaims,
  workspaceName: string
): boolean => {
  if (!workspaceName) {
    return false
  }

  const workspaceNameLower = workspaceName.toLowerCase()

  // Check tenant_id match (case-insensitive)
  if (claims['custom:tenant_id']) {
    const tenantIdLower = claims['custom:tenant_id'].toLowerCase()
    if (tenantIdLower === workspaceNameLower) {
      logger.info('WorkspaceAccess match found via tenant_id', {
        tenantId: claims['custom:tenant_id'],
        workspace: workspaceName,
      })
      return true
    }
  }

  // Check claudia_projects match (case-insensitive)
  // claudia_projects is expected to be a comma-separated string of project names
  if (claims['custom:claudia_projects']) {
    const projectsLower = claims['custom:claudia_projects']
      .toLowerCase()
      .split(',')
      .map((project) => project.trim())

    if (projectsLower.includes(workspaceNameLower)) {
      logger.info('WorkspaceAccess match found via claudia_projects', {
        claudiaProjects: claims['custom:claudia_projects'],
        workspace: workspaceName,
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
  workspaceName?: string
): CognitoWorkspaceAccessResult => {
  if (!workspaceName || !user.cognitoClaims) {
    return { hasAccess: false }
  }

  const cognitoClaims = extractCognitoUserClaims(user)
  if (!cognitoClaims || !hasWorkspaceAccess(cognitoClaims, workspaceName)) {
    return { hasAccess: false }
  }

  const role = cognitoClaims['custom:hub_role']
    ? mapCognitoRoleToWorkspaceRole(cognitoClaims['custom:hub_role'])
    : WorkspaceRole.MEMBER

  return { hasAccess: true, role, claims: cognitoClaims }
}
