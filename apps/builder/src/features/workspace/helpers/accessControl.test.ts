import { vi } from 'vitest'

// Mock must be at the top level before any other imports
vi.mock('@typebot.io/env', () => ({
  env: {
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    ENCRYPTION_SECRET: '12345678901234567890123456789012',
    ADMIN_EMAIL: ['admin@test.com'],
  },
}))

import { describe, it, expect } from 'vitest'
import { WorkspaceRole } from '@typebot.io/prisma'

import { isReadWorkspaceFobidden } from './isReadWorkspaceFobidden'
import { isWriteWorkspaceForbidden } from './isWriteWorkspaceForbidden'
import { isAdminWriteWorkspaceForbidden } from './isAdminWriteWorkspaceForbidden'

describe('Access Control Helpers', () => {
  const baseWorkspace = {
    members: [
      { userId: 'user-123', role: WorkspaceRole.MEMBER },
      { userId: 'user-456', role: WorkspaceRole.ADMIN },
      { userId: 'user-789', role: WorkspaceRole.GUEST },
    ],
    id: 'ws-shopee-123',
  }

  const baseUser = {
    id: 'user-123',
    email: 'test@example.com',
  }

  describe('isReadWorkspaceFobidden', () => {
    it('should allow access via Cognito claims when eddie_workspaces contains workspace id', () => {
      const user = {
        ...baseUser,
        cognitoClaims: {
          'custom:hub_role': 'CLIENT',
          'custom:eddie_workspaces': 'ws-shopee-123,ws-other',
        },
      }

      const forbidden = isReadWorkspaceFobidden(baseWorkspace, user)
      expect(forbidden).toBe(false)
    })

    it('should allow access for ADMIN hub_role even when eddie_workspaces does not match', () => {
      const user = {
        ...baseUser,
        cognitoClaims: {
          'custom:hub_role': 'ADMIN',
          'custom:eddie_workspaces': 'ws-different,ws-other',
        },
      }

      const forbidden = isReadWorkspaceFobidden(baseWorkspace, user)
      expect(forbidden).toBe(false) // ADMIN has universal access
    })

    it('should fallback to database members when Cognito claims do not match for non-ADMIN roles', () => {
      const user = {
        ...baseUser,
        cognitoClaims: {
          'custom:hub_role': 'CLIENT',
          'custom:eddie_workspaces': 'ws-different,ws-other',
        },
      }

      const forbidden = isReadWorkspaceFobidden(baseWorkspace, user)
      expect(forbidden).toBe(false) // Should find user in members
    })

    it('should deny access when no Cognito claims and not in members', () => {
      const user = {
        id: 'unknown-user',
        email: 'unknown@example.com',
      }

      const forbidden = isReadWorkspaceFobidden(baseWorkspace, user)
      expect(forbidden).toBe(true)
    })

    it('should handle workspace without id', () => {
      const workspaceWithoutId = {
        members: baseWorkspace.members,
      }

      const user = {
        ...baseUser,
        cognitoClaims: {
          'custom:hub_role': 'ADMIN',
          'custom:eddie_workspaces': 'ws-shopee-123',
        },
      }

      const forbidden = isReadWorkspaceFobidden(workspaceWithoutId, user)
      expect(forbidden).toBe(false) // Should fallback to database and find user
    })

    it('should handle nested token structure', () => {
      const user = {
        ...baseUser,
        cognitoClaims: {
          token: {
            'custom:hub_role': 'ADMIN',
            'custom:eddie_workspaces': 'ws-shopee-123',
          },
        },
      }

      const forbidden = isReadWorkspaceFobidden(baseWorkspace, user)
      expect(forbidden).toBe(false)
    })
  })

  describe('isWriteWorkspaceForbidden', () => {
    it('should allow write access for all Cognito roles when eddie_workspaces matches', () => {
      const adminUser = {
        ...baseUser,
        cognitoClaims: {
          'custom:hub_role': 'ADMIN',
          'custom:eddie_workspaces': 'ws-shopee-123',
        },
      }

      const clientUser = {
        ...baseUser,
        cognitoClaims: {
          'custom:hub_role': 'CLIENT',
          'custom:eddie_workspaces': 'ws-shopee-123',
        },
      }

      expect(isWriteWorkspaceForbidden(baseWorkspace, adminUser)).toBe(false)
      expect(isWriteWorkspaceForbidden(baseWorkspace, clientUser)).toBe(false)
    })

    it('should fallback to database and deny write for GUEST role', () => {
      const guestUser = {
        id: 'user-789',
        email: 'guest@example.com',
      }

      const forbidden = isWriteWorkspaceForbidden(baseWorkspace, guestUser)
      expect(forbidden).toBe(true)
    })

    it('should allow write for database ADMIN and MEMBER roles', () => {
      const adminUser = { id: 'user-456', email: 'admin@example.com' }
      const memberUser = { id: 'user-123', email: 'member@example.com' }

      expect(isWriteWorkspaceForbidden(baseWorkspace, adminUser)).toBe(false)
      expect(isWriteWorkspaceForbidden(baseWorkspace, memberUser)).toBe(false)
    })

    it('should deny access when no Cognito claims and not in members', () => {
      const unknownUser = {
        id: 'unknown-user',
        email: 'unknown@example.com',
      }

      const forbidden = isWriteWorkspaceForbidden(baseWorkspace, unknownUser)
      expect(forbidden).toBe(true)
    })
  })

  describe('isAdminWriteWorkspaceForbidden', () => {
    it('should allow admin access for ADMIN and MANAGER Cognito roles', () => {
      const adminUser = {
        ...baseUser,
        cognitoClaims: {
          'custom:hub_role': 'ADMIN',
          'custom:eddie_workspaces': 'ws-shopee-123',
        },
      }

      const managerUser = {
        ...baseUser,
        cognitoClaims: {
          'custom:hub_role': 'MANAGER',
          'custom:eddie_workspaces': 'ws-shopee-123',
        },
      }

      expect(isAdminWriteWorkspaceForbidden(baseWorkspace, adminUser)).toBe(
        false
      )
      expect(isAdminWriteWorkspaceForbidden(baseWorkspace, managerUser)).toBe(
        false
      )
    })

    it('should deny admin access for CLIENT Cognito role', () => {
      const clientUser = {
        ...baseUser,
        cognitoClaims: {
          'custom:hub_role': 'CLIENT',
          'custom:eddie_workspaces': 'ws-shopee-123',
        },
      }

      const forbidden = isAdminWriteWorkspaceForbidden(
        baseWorkspace,
        clientUser
      )
      expect(forbidden).toBe(true)
    })

    it('should fallback to database and allow admin access for database ADMIN role', () => {
      const adminUser = {
        id: 'user-456',
        email: 'admin@example.com',
      }

      const forbidden = isAdminWriteWorkspaceForbidden(baseWorkspace, adminUser)
      expect(forbidden).toBe(false)
    })

    it('should fallback to database and deny admin access for database MEMBER role', () => {
      const memberUser = {
        id: 'user-123',
        email: 'member@example.com',
      }

      const forbidden = isAdminWriteWorkspaceForbidden(
        baseWorkspace,
        memberUser
      )
      expect(forbidden).toBe(true)
    })

    it('should deny access when no Cognito claims and not in members', () => {
      const unknownUser = {
        id: 'unknown-user',
        email: 'unknown@example.com',
      }

      const forbidden = isAdminWriteWorkspaceForbidden(
        baseWorkspace,
        unknownUser
      )
      expect(forbidden).toBe(true)
    })
  })
})
