import { WorkspaceRole } from '@typebot.io/prisma'
import logger from '@/helpers/logger'
import { checkCognitoWorkspaceAccess } from './cognitoUtils'
import { WorkspaceMember } from '@typebot.io/schemas'

// Type for Prisma member objects with basic user info
type PrismaMemberWithUser = {
  userId: string
  role: WorkspaceRole
  workspaceId: string
  user: {
    name: string | null
    email: string | null
    image: string | null
  }
}

// Type for basic Prisma member objects without user relation
type BasicPrismaMember = {
  userId: string
  role: WorkspaceRole
  workspaceId: string
  createdAt: Date
  updatedAt: Date
}

// Function overloads for different member types
export function getUserRoleInWorkspace(
  userId: string,
  workspaceMembers: WorkspaceMember[] | undefined,
  workspaceName?: string,
  user?: unknown
): WorkspaceRole | undefined

export function getUserRoleInWorkspace(
  userId: string,
  workspaceMembers: PrismaMemberWithUser[] | undefined,
  workspaceName?: string,
  user?: unknown
): WorkspaceRole | undefined

export function getUserRoleInWorkspace(
  userId: string,
  workspaceMembers: BasicPrismaMember[] | undefined,
  workspaceName?: string,
  user?: unknown
): WorkspaceRole | undefined

// Implementation
export function getUserRoleInWorkspace(
  userId: string,
  workspaceMembers:
    | WorkspaceMember[]
    | PrismaMemberWithUser[]
    | BasicPrismaMember[]
    | undefined,
  workspaceName?: string,
  user?: unknown
): WorkspaceRole | undefined {
  // Primary: Check Cognito token claims if workspace name is provided
  if (workspaceName && user && typeof user === 'object' && user !== null) {
    const userWithCognito = user as {
      id: string
      email: string
      cognitoClaims?: unknown
    }
    const cognitoAccess = checkCognitoWorkspaceAccess(
      userWithCognito,
      workspaceName
    )

    if (cognitoAccess.hasAccess) {
      logger.info('User authenticated via Cognito token', {
        workspace: workspaceName,
        role: cognitoAccess.role,
        userId,
      })
      return cognitoAccess.role
    }
  }

  // Fallback: Use existing database-based approach
  const dbMember = workspaceMembers?.find((member) => member.userId === userId)
  if (dbMember) {
    logger.info('User authenticated via database', {
      userId,
      role: dbMember.role,
      workspace: workspaceName || 'not specified',
    })
  }
  return dbMember?.role
}
