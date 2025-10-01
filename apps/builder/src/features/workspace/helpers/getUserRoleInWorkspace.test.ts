import { describe, it, expect } from 'vitest'
import { WorkspaceRole } from '@typebot.io/prisma'
import { getUserRoleInWorkspace } from './getUserRoleInWorkspace'

describe('getUserRoleInWorkspace', () => {
  const userId = 'user-123'
  const workspaceName = 'shopee'
  const workspaceMembers = [
    {
      userId: 'user-123',
      workspaceId: 'workspace-456',
      role: WorkspaceRole.MEMBER,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  describe('Cognito token claims with workspace name matching', () => {
    it('should return ADMIN role when hub_role is ADMIN and tenant_id matches workspace name', () => {
      const user = {
        'custom:hub_role': 'ADMIN',
        'custom:tenant_id': 'shopee',
      }

      const role = getUserRoleInWorkspace(
        userId,
        workspaceMembers,
        workspaceName,
        user
      )
      expect(role).toBe(WorkspaceRole.ADMIN)
    })

    it('should return ADMIN role when hub_role is MANAGER and tenant_id matches workspace name', () => {
      const user = {
        'custom:hub_role': 'MANAGER',
        'custom:tenant_id': 'shopee',
      }

      const role = getUserRoleInWorkspace(
        userId,
        workspaceMembers,
        workspaceName,
        user
      )
      expect(role).toBe(WorkspaceRole.ADMIN)
    })

    it('should return MEMBER role when hub_role is CLIENT and tenant_id matches workspace name', () => {
      const user = {
        'custom:hub_role': 'CLIENT',
        'custom:tenant_id': 'shopee',
      }

      const role = getUserRoleInWorkspace(
        userId,
        workspaceMembers,
        workspaceName,
        user
      )
      expect(role).toBe(WorkspaceRole.MEMBER)
    })

    it('should fallback to database when tenant_id does not match workspace name', () => {
      const user = {
        'custom:hub_role': 'ADMIN',
        'custom:tenant_id': 'different-tenant',
      }

      const role = getUserRoleInWorkspace(
        userId,
        workspaceMembers,
        workspaceName,
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
        workspaceName,
        undefined
      )
      expect(role).toBe(WorkspaceRole.MEMBER)
    })

    it('should use database when user object is empty', () => {
      const role = getUserRoleInWorkspace(
        userId,
        workspaceMembers,
        workspaceName,
        {}
      )
      expect(role).toBe(WorkspaceRole.MEMBER)
    })

    it('should return undefined when no access found anywhere', () => {
      const user = {
        'custom:hub_role': 'ADMIN',
        'custom:tenant_id': 'other-tenant',
      }

      const role = getUserRoleInWorkspace(
        'unknown-user',
        [],
        workspaceName,
        user
      )
      expect(role).toBeUndefined()
    })
  })

  describe('New claudia_projects functionality', () => {
    it('should return ADMIN role when workspace matches claudia_projects (case-insensitive)', () => {
      const user = {
        'custom:hub_role': 'ADMIN',
        'custom:tenant_id': 'different-tenant',
        'custom:claudia_projects': 'Project1,SHOPEE,Project3',
      }

      const role = getUserRoleInWorkspace(
        userId,
        [],
        workspaceName, // "shopee"
        user
      )
      expect(role).toBe(WorkspaceRole.ADMIN)
    })

    it('should return MEMBER role when workspace matches claudia_projects and hub_role is CLIENT', () => {
      const user = {
        'custom:hub_role': 'CLIENT',
        'custom:tenant_id': 'different-tenant',
        'custom:claudia_projects': 'Project1,shopee,Project3',
      }

      const role = getUserRoleInWorkspace(userId, [], workspaceName, user)
      expect(role).toBe(WorkspaceRole.MEMBER)
    })

    it('should handle case-insensitive tenant_id matching', () => {
      const user = {
        'custom:hub_role': 'MANAGER',
        'custom:tenant_id': 'SHOPEE',
      }

      const role = getUserRoleInWorkspace(
        userId,
        [],
        workspaceName, // "shopee"
        user
      )
      expect(role).toBe(WorkspaceRole.ADMIN)
    })

    it('should prioritize tenant_id over claudia_projects when both match', () => {
      const user = {
        'custom:hub_role': 'CLIENT', // Would be MEMBER via claudia_projects
        'custom:tenant_id': 'SHOPEE', // But tenant_id makes it MEMBER too
        'custom:claudia_projects': 'shopee,other-project',
      }

      const role = getUserRoleInWorkspace(userId, [], workspaceName, user)
      // Should use hub_role mapping from tenant_id match
      expect(role).toBe(WorkspaceRole.MEMBER)
    })

    it('should fallback to database when no Cognito match found', () => {
      const user = {
        'custom:hub_role': 'ADMIN',
        'custom:tenant_id': 'different-tenant',
        'custom:claudia_projects': 'Project1,Project2,Project3',
      }

      const role = getUserRoleInWorkspace(
        userId,
        workspaceMembers,
        workspaceName,
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
      const role = getUserRoleInWorkspace(
        userId,
        workspaceMembers,
        workspaceName
      )
      expect(role).toBe(WorkspaceRole.MEMBER)
    })
  })

  describe('Edge cases', () => {
    it('should handle missing workspace name gracefully', () => {
      const user = {
        'custom:hub_role': 'ADMIN',
        'custom:tenant_id': 'shopee',
      }

      const role = getUserRoleInWorkspace(
        userId,
        workspaceMembers,
        undefined,
        user
      )
      expect(role).toBe(WorkspaceRole.MEMBER)
    })

    it('should handle empty tenant_id', () => {
      const user = {
        'custom:hub_role': 'ADMIN',
        'custom:tenant_id': '',
      }

      const role = getUserRoleInWorkspace(
        userId,
        workspaceMembers,
        workspaceName,
        user
      )
      expect(role).toBe(WorkspaceRole.MEMBER)
    })

    it('should handle missing hub_role', () => {
      const user = {
        'custom:tenant_id': 'shopee',
      }

      const role = getUserRoleInWorkspace(
        userId,
        workspaceMembers,
        workspaceName,
        user
      )
      expect(role).toBe(WorkspaceRole.MEMBER)
    })

    it('should handle invalid JSON-like structures gracefully', () => {
      const user = {
        'custom:hub_role': null,
        'custom:tenant_id': undefined,
      }

      const role = getUserRoleInWorkspace(
        userId,
        workspaceMembers,
        workspaceName,
        user
      )
      expect(role).toBe(WorkspaceRole.MEMBER)
    })
  })
})
