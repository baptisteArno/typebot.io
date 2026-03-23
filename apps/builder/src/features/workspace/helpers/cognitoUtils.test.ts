import { describe, it, expect, vi } from 'vitest'
import { WorkspaceRole } from '@typebot.io/prisma'

// Mock the logger
vi.mock('@/helpers/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

import {
  extractCognitoUserClaims,
  mapCognitoRoleToWorkspaceRole,
  hasWorkspaceAccess,
  checkCognitoWorkspaceAccess,
} from './cognitoUtils'

describe('extractCognitoUserClaims', () => {
  it('should extract claims from user object with cognitoClaims property', () => {
    const user = {
      cognitoClaims: {
        'custom:hub_role': 'ADMIN',
        'custom:eddie_workspaces': 'ws-123,ws-456',
      },
    }

    const claims = extractCognitoUserClaims(user)

    expect(claims).toEqual({
      'custom:hub_role': 'ADMIN',
      'custom:eddie_workspaces': 'ws-123,ws-456',
    })
  })

  it('should return undefined for null user', () => {
    const claims = extractCognitoUserClaims(null)
    expect(claims).toBeUndefined()
  })

  it('should return undefined for undefined user', () => {
    const claims = extractCognitoUserClaims(undefined)
    expect(claims).toBeUndefined()
  })

  it('should return undefined for empty user object', () => {
    const claims = extractCognitoUserClaims({})
    expect(claims).toBeUndefined()
  })

  it('should return undefined when cognitoClaims is missing', () => {
    const user = {
      id: 'user123',
      email: 'test@example.com',
    }

    const claims = extractCognitoUserClaims(user)
    expect(claims).toBeUndefined()
  })

  it('should return undefined when cognitoClaims is null', () => {
    const user = {
      cognitoClaims: null,
    }

    const claims = extractCognitoUserClaims(user)
    expect(claims).toBeUndefined()
  })

  it('should return undefined when missing hub_role and eddie_workspaces', () => {
    const user = {
      cognitoClaims: {
        'other:claim': 'value',
      },
    }

    const claims = extractCognitoUserClaims(user)
    expect(claims).toBeUndefined()
  })

  it('should extract claims when only hub_role is present', () => {
    const user = {
      cognitoClaims: {
        'custom:hub_role': 'ADMIN',
      },
    }

    const claims = extractCognitoUserClaims(user)
    expect(claims).toEqual({
      'custom:hub_role': 'ADMIN',
    })
  })

  it('should extract claims when only eddie_workspaces is present', () => {
    const user = {
      cognitoClaims: {
        'custom:eddie_workspaces': 'ws-123,ws-456',
      },
    }

    const claims = extractCognitoUserClaims(user)
    expect(claims).toEqual({
      'custom:eddie_workspaces': 'ws-123,ws-456',
    })
  })

  it('should handle malformed cognitoClaims gracefully', () => {
    const user = {
      cognitoClaims: {
        'custom:hub_role': null,
        'custom:eddie_workspaces': undefined,
      },
    }

    const claims = extractCognitoUserClaims(user)
    expect(claims).toBeUndefined()
  })
})

describe('mapCognitoRoleToWorkspaceRole', () => {
  it('should map ADMIN to ADMIN', () => {
    expect(mapCognitoRoleToWorkspaceRole('ADMIN')).toBe(WorkspaceRole.ADMIN)
  })

  it('should map MANAGER to ADMIN', () => {
    expect(mapCognitoRoleToWorkspaceRole('MANAGER')).toBe(WorkspaceRole.ADMIN)
  })

  it('should map CLIENT to MEMBER', () => {
    expect(mapCognitoRoleToWorkspaceRole('CLIENT')).toBe(WorkspaceRole.MEMBER)
  })

  it('should default unknown roles to MEMBER', () => {
    expect(mapCognitoRoleToWorkspaceRole('UNKNOWN')).toBe(WorkspaceRole.MEMBER)
  })

  it('should handle empty string', () => {
    expect(mapCognitoRoleToWorkspaceRole('')).toBe(WorkspaceRole.MEMBER)
  })

  it('should handle null/undefined gracefully', () => {
    expect(mapCognitoRoleToWorkspaceRole(null as unknown as string)).toBe(
      WorkspaceRole.MEMBER
    )
    expect(mapCognitoRoleToWorkspaceRole(undefined as unknown as string)).toBe(
      WorkspaceRole.MEMBER
    )
  })

  it('should be case sensitive', () => {
    expect(mapCognitoRoleToWorkspaceRole('admin')).toBe(WorkspaceRole.MEMBER)
    expect(mapCognitoRoleToWorkspaceRole('Admin')).toBe(WorkspaceRole.MEMBER)
  })
})

describe('hasWorkspaceAccess', () => {
  it('should return true when eddie_workspaces contains the workspace id', () => {
    const claims = {
      'custom:hub_role': 'ADMIN' as const,
      'custom:eddie_workspaces': 'ws-123,ws-456,ws-789',
    }

    expect(hasWorkspaceAccess(claims, 'ws-456')).toBe(true)
  })

  it('should return true when eddie_workspaces contains the workspace id with extra spaces', () => {
    const claims = {
      'custom:hub_role': 'ADMIN' as const,
      'custom:eddie_workspaces': ' ws-123 , ws-456 , ws-789 ',
    }

    expect(hasWorkspaceAccess(claims, 'ws-456')).toBe(true)
  })

  it('should return false when eddie_workspaces does not contain the workspace id', () => {
    const claims = {
      'custom:hub_role': 'CLIENT' as const,
      'custom:eddie_workspaces': 'ws-123,ws-456',
    }

    expect(hasWorkspaceAccess(claims, 'ws-999')).toBe(false)
  })

  it('should return true for ADMIN even when eddie_workspaces does not contain the workspace id', () => {
    const claims = {
      'custom:hub_role': 'ADMIN' as const,
      'custom:eddie_workspaces': 'ws-123,ws-456',
    }

    expect(hasWorkspaceAccess(claims, 'ws-999')).toBe(true)
  })

  it('should return false when workspace id is empty', () => {
    const claims = {
      'custom:hub_role': 'ADMIN' as const,
      'custom:eddie_workspaces': 'ws-123,ws-456',
    }

    expect(hasWorkspaceAccess(claims, '')).toBe(false)
  })

  it('should return false when no eddie_workspaces is provided', () => {
    const claims = {
      'custom:hub_role': 'CLIENT' as const,
    }

    expect(hasWorkspaceAccess(claims, 'ws-123')).toBe(false)
  })

  it('should return true for ADMIN even when no eddie_workspaces is provided', () => {
    const claims = {
      'custom:hub_role': 'ADMIN' as const,
    }

    expect(hasWorkspaceAccess(claims, 'ws-123')).toBe(true)
  })

  it('should handle single workspace in eddie_workspaces', () => {
    const claims = {
      'custom:hub_role': 'ADMIN' as const,
      'custom:eddie_workspaces': 'ws-123',
    }

    expect(hasWorkspaceAccess(claims, 'ws-123')).toBe(true)
  })

  it('should use exact match (case-sensitive) for workspace id', () => {
    const claims = {
      'custom:hub_role': 'ADMIN' as const,
      'custom:eddie_workspaces': 'ws-123,WS-456',
    }

    expect(hasWorkspaceAccess(claims, 'ws-456')).toBe(false)
    expect(hasWorkspaceAccess(claims, 'WS-456')).toBe(true)
  })
})

describe('checkCognitoWorkspaceAccess', () => {
  it('should return hasAccess false when workspaceId is missing', () => {
    const user = {
      id: 'user123',
      email: 'test@example.com',
      cognitoClaims: {
        'custom:hub_role': 'ADMIN',
        'custom:eddie_workspaces': 'ws-123',
      },
    }

    expect(checkCognitoWorkspaceAccess(user, undefined)).toEqual({
      hasAccess: false,
    })
  })

  it('should return hasAccess false when cognitoClaims is missing', () => {
    const user = {
      id: 'user123',
      email: 'test@example.com',
    }

    expect(checkCognitoWorkspaceAccess(user, 'ws-123')).toEqual({
      hasAccess: false,
    })
  })

  it('should return hasAccess false when workspace id is not in eddie_workspaces', () => {
    const user = {
      id: 'user123',
      email: 'test@example.com',
      cognitoClaims: {
        'custom:hub_role': 'ADMIN',
        'custom:eddie_workspaces': 'ws-456,ws-789',
      },
    }

    expect(checkCognitoWorkspaceAccess(user, 'ws-123')).toEqual({
      hasAccess: false,
    })
  })

  it('should return hasAccess true with mapped role when hub_role is present', () => {
    const user = {
      id: 'user123',
      email: 'test@example.com',
      cognitoClaims: {
        'custom:hub_role': 'ADMIN',
        'custom:eddie_workspaces': 'ws-123,ws-456',
      },
    }

    const result = checkCognitoWorkspaceAccess(user, 'ws-123')
    expect(result.hasAccess).toBe(true)
    expect(result.role).toBe(WorkspaceRole.ADMIN)
    expect(result.claims).toEqual({
      'custom:hub_role': 'ADMIN',
      'custom:eddie_workspaces': 'ws-123,ws-456',
    })
  })

  it('should return MEMBER role when hub_role is absent but workspace matches', () => {
    const user = {
      id: 'user123',
      email: 'test@example.com',
      cognitoClaims: {
        'custom:eddie_workspaces': 'ws-123,ws-456',
      },
    }

    const result = checkCognitoWorkspaceAccess(user, 'ws-123')
    expect(result.hasAccess).toBe(true)
    expect(result.role).toBe(WorkspaceRole.MEMBER)
  })

  it('should map CLIENT hub_role to MEMBER workspace role', () => {
    const user = {
      id: 'user123',
      email: 'test@example.com',
      cognitoClaims: {
        'custom:hub_role': 'CLIENT',
        'custom:eddie_workspaces': 'ws-123',
      },
    }

    const result = checkCognitoWorkspaceAccess(user, 'ws-123')
    expect(result.hasAccess).toBe(true)
    expect(result.role).toBe(WorkspaceRole.MEMBER)
  })
})
