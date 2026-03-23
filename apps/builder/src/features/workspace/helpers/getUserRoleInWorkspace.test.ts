import { describe, it, expect } from 'vitest'
import { WorkspaceRole } from '@typebot.io/prisma'
import { getUserRoleInWorkspace } from './getUserRoleInWorkspace'

describe('getUserRoleInWorkspace', () => {
  const userId = 'user-123'
  const workspaceId = 'workspace-456'
  const workspaceMembers = [
    {
      userId: 'user-123',
      workspaceId: 'workspace-456',
      role: WorkspaceRole.MEMBER,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  describe('Cognito token claims with workspace ID matching', () => {
    it('should return ADMIN role when hub_role is ADMIN and eddie_workspaces contains workspace id', () => {
      const user = {
        id: userId,
        email: 'test@example.com',
        cognitoClaims: {
          'custom:hub_role': 'ADMIN',
          'custom:eddie_workspaces': 'workspace-456,ws-789',
        },
      }

      const role = getUserRoleInWorkspace(
        userId,
        workspaceMembers,
        workspaceId,
        user
      )
      expect(role).toBe(WorkspaceRole.ADMIN)
    })

    it('should return ADMIN role when hub_role is MANAGER and eddie_workspaces contains workspace id', () => {
      const user = {
        id: userId,
        email: 'test@example.com',
        cognitoClaims: {
          'custom:hub_role': 'MANAGER',
          'custom:eddie_workspaces': 'workspace-456',
        },
      }

      const role = getUserRoleInWorkspace(
        userId,
        workspaceMembers,
        workspaceId,
        user
      )
      expect(role).toBe(WorkspaceRole.ADMIN)
    })

    it('should return MEMBER role when hub_role is CLIENT and eddie_workspaces contains workspace id', () => {
      const user = {
        id: userId,
        email: 'test@example.com',
        cognitoClaims: {
          'custom:hub_role': 'CLIENT',
          'custom:eddie_workspaces': 'workspace-456',
        },
      }

      const role = getUserRoleInWorkspace(
        userId,
        workspaceMembers,
        workspaceId,
        user
      )
      expect(role).toBe(WorkspaceRole.MEMBER)
    })

    it('should return ADMIN for hub_role ADMIN even when eddie_workspaces does not contain workspace id', () => {
      const user = {
        id: userId,
        email: 'test@example.com',
        cognitoClaims: {
          'custom:hub_role': 'ADMIN',
          'custom:eddie_workspaces': 'ws-other,ws-999',
        },
      }

      const role = getUserRoleInWorkspace(
        userId,
        workspaceMembers,
        workspaceId,
        user
      )
      expect(role).toBe(WorkspaceRole.ADMIN)
    })

    it('should fallback to database when eddie_workspaces does not contain workspace id for non-ADMIN roles', () => {
      const user = {
        id: userId,
        email: 'test@example.com',
        cognitoClaims: {
          'custom:hub_role': 'CLIENT',
          'custom:eddie_workspaces': 'ws-other,ws-999',
        },
      }

      const role = getUserRoleInWorkspace(
        userId,
        workspaceMembers,
        workspaceId,
        user
      )
      expect(role).toBe(WorkspaceRole.MEMBER)
    })
  })

  describe('Database fallback', () => {
    it('should use database when Cognito claims are missing', () => {
      const role = getUserRoleInWorkspace(
        userId,
        workspaceMembers,
        workspaceId,
        undefined
      )
      expect(role).toBe(WorkspaceRole.MEMBER)
    })

    it('should use database when user object is empty', () => {
      const role = getUserRoleInWorkspace(
        userId,
        workspaceMembers,
        workspaceId,
        {}
      )
      expect(role).toBe(WorkspaceRole.MEMBER)
    })

    it('should return ADMIN when hub_role is ADMIN even with unknown user and no database match', () => {
      const user = {
        id: 'unknown-user',
        email: 'unknown@example.com',
        cognitoClaims: {
          'custom:hub_role': 'ADMIN',
          'custom:eddie_workspaces': 'ws-other',
        },
      }

      const role = getUserRoleInWorkspace('unknown-user', [], workspaceId, user)
      expect(role).toBe(WorkspaceRole.ADMIN)
    })

    it('should return undefined when no access found anywhere for non-ADMIN roles', () => {
      const user = {
        id: 'unknown-user',
        email: 'unknown@example.com',
        cognitoClaims: {
          'custom:hub_role': 'CLIENT',
          'custom:eddie_workspaces': 'ws-other',
        },
      }

      const role = getUserRoleInWorkspace('unknown-user', [], workspaceId, user)
      expect(role).toBeUndefined()
    })
  })

  describe('eddie_workspaces functionality', () => {
    it('should return ADMIN role when workspace id is in eddie_workspaces', () => {
      const user = {
        id: userId,
        email: 'test@example.com',
        cognitoClaims: {
          'custom:hub_role': 'ADMIN',
          'custom:eddie_workspaces': 'ws-111,workspace-456,ws-333',
        },
      }

      const role = getUserRoleInWorkspace(userId, [], workspaceId, user)
      expect(role).toBe(WorkspaceRole.ADMIN)
    })

    it('should return MEMBER role when hub_role is CLIENT and workspace id matches', () => {
      const user = {
        id: userId,
        email: 'test@example.com',
        cognitoClaims: {
          'custom:hub_role': 'CLIENT',
          'custom:eddie_workspaces': 'ws-111,workspace-456,ws-333',
        },
      }

      const role = getUserRoleInWorkspace(userId, [], workspaceId, user)
      expect(role).toBe(WorkspaceRole.MEMBER)
    })

    it('should use exact match (case-sensitive) for workspace id', () => {
      const user = {
        id: userId,
        email: 'test@example.com',
        cognitoClaims: {
          'custom:hub_role': 'MANAGER',
          'custom:eddie_workspaces': 'WORKSPACE-456',
        },
      }

      const role = getUserRoleInWorkspace(
        userId,
        workspaceMembers,
        workspaceId, // "workspace-456"
        user
      )
      // Should NOT match because case-sensitive, falls back to database
      expect(role).toBe(WorkspaceRole.MEMBER)
    })

    it('should return ADMIN for hub_role ADMIN even when no Cognito workspace match found', () => {
      const user = {
        id: userId,
        email: 'test@example.com',
        cognitoClaims: {
          'custom:hub_role': 'ADMIN',
          'custom:eddie_workspaces': 'ws-111,ws-222,ws-333',
        },
      }

      const role = getUserRoleInWorkspace(
        userId,
        workspaceMembers,
        workspaceId,
        user
      )
      expect(role).toBe(WorkspaceRole.ADMIN)
    })

    it('should fallback to database when no Cognito match found for non-ADMIN roles', () => {
      const user = {
        id: userId,
        email: 'test@example.com',
        cognitoClaims: {
          'custom:hub_role': 'CLIENT',
          'custom:eddie_workspaces': 'ws-111,ws-222,ws-333',
        },
      }

      const role = getUserRoleInWorkspace(
        userId,
        workspaceMembers,
        workspaceId,
        user
      )
      expect(role).toBe(WorkspaceRole.MEMBER) // From database
    })
  })

  describe('Backward compatibility', () => {
    it('should work with legacy two-parameter signature', () => {
      const role = getUserRoleInWorkspace(userId, workspaceMembers)
      expect(role).toBe(WorkspaceRole.MEMBER)
    })

    it('should work with three-parameter signature (no user)', () => {
      const role = getUserRoleInWorkspace(userId, workspaceMembers, workspaceId)
      expect(role).toBe(WorkspaceRole.MEMBER)
    })
  })

  describe('Edge cases', () => {
    it('should handle missing workspace id gracefully', () => {
      const user = {
        id: userId,
        email: 'test@example.com',
        cognitoClaims: {
          'custom:hub_role': 'ADMIN',
          'custom:eddie_workspaces': 'workspace-456',
        },
      }

      const role = getUserRoleInWorkspace(
        userId,
        workspaceMembers,
        undefined,
        user
      )
      expect(role).toBe(WorkspaceRole.MEMBER)
    })

    it('should handle empty eddie_workspaces', () => {
      const user = {
        id: userId,
        email: 'test@example.com',
        cognitoClaims: {
          'custom:hub_role': 'ADMIN',
          'custom:eddie_workspaces': '',
        },
      }

      const role = getUserRoleInWorkspace(
        userId,
        workspaceMembers,
        workspaceId,
        user
      )
      expect(role).toBe(WorkspaceRole.MEMBER)
    })

    it('should handle missing hub_role but with eddie_workspaces match', () => {
      const user = {
        id: userId,
        email: 'test@example.com',
        cognitoClaims: {
          'custom:eddie_workspaces': 'workspace-456',
        },
      }

      const role = getUserRoleInWorkspace(
        userId,
        workspaceMembers,
        workspaceId,
        user
      )
      expect(role).toBe(WorkspaceRole.MEMBER)
    })

    it('should handle invalid JSON-like structures gracefully', () => {
      const user = {
        'custom:hub_role': null,
        'custom:eddie_workspaces': undefined,
      }

      const role = getUserRoleInWorkspace(
        userId,
        workspaceMembers,
        workspaceId,
        user
      )
      expect(role).toBe(WorkspaceRole.MEMBER)
    })
  })
})
