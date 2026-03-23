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
  workspaceId?: string,
  user?: unknown
): WorkspaceRole | undefined

export function getUserRoleInWorkspace(
  userId: string,
  workspaceMembers: PrismaMemberWithUser[] | undefined,
  workspaceId?: string,
  user?: unknown
): WorkspaceRole | undefined

export function getUserRoleInWorkspace(
  userId: string,
  workspaceMembers: BasicPrismaMember[] | undefined,
  workspaceId?: string,
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
  workspaceId?: string,
  user?: unknown
): WorkspaceRole | undefined {
  // Primary: Check Cognito token claims if workspace ID is provided
  if (workspaceId && user && typeof user === 'object' && user !== null) {
    const userWithCognito = user as {
      id: string
      email: string
      cognitoClaims?: unknown
    }
    const cognitoAccess = checkCognitoWorkspaceAccess(
      userWithCognito,
      workspaceId
    )

    if (cognitoAccess.hasAccess) {
      logger.info('User authenticated via Cognito token', {
        workspace: workspaceId,
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
      workspace: workspaceId || 'not specified',
    })
  }
  return dbMember?.role
}
