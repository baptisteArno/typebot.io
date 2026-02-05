import { vi, describe, it, expect, beforeEach } from 'vitest'
import { createTypebot } from './createTypebot'
import { WorkspaceRole, Plan } from '@typebot.io/prisma'
import { getUserRoleInWorkspace } from '@/features/workspace/helpers/getUserRoleInWorkspace'
import prisma from '@typebot.io/lib/prisma'

vi.mock('@typebot.io/lib/prisma', () => ({
  default: {
    workspace: {
      findUnique: vi.fn(),
    },
    typebot: {
      create: vi.fn(),
    },
    dashboardFolder: {
      findUnique: vi.fn(),
    },
  },
}))
vi.mock('@typebot.io/telemetry/trackEvents', () => ({
  trackEvents: vi.fn(),
}))
vi.mock('../helpers/sanitizers', () => ({
  isCustomDomainNotAvailable: vi.fn(),
  isPublicIdNotAvailable: vi.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sanitizeGroups: vi.fn(() => (groups: any) => groups),
  sanitizeSettings: vi.fn((s) => s),
  sanitizeVariables: vi.fn(() => []),
}))
vi.mock('@/features/workspace/helpers/getUserRoleInWorkspace', () => ({
  getUserRoleInWorkspace: vi.fn(),
}))

describe('createTypebot', () => {
  const mockUser = { id: 'user-1', email: 'test@test.com' }
  const mockWorkspace = {
    id: 'ws-1',
    members: [{ userId: mockUser.id, role: WorkspaceRole.ADMIN }],
    plan: Plan.FREE,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.workspace.findUnique).mockResolvedValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockWorkspace as any
    )
    vi.mocked(getUserRoleInWorkspace).mockReturnValue(WorkspaceRole.ADMIN)
  })

  it('should throw if TOOL is missing tenant', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const caller = createTypebot.createCaller({ user: mockUser } as any)

    await expect(
      caller({
        workspaceId: mockWorkspace.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typebot: {
          name: 'My Bot',
          settings: { general: { type: 'TOOL' } },
          toolDescription: 'desc',
          // tenant missing
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      })
    ).rejects.toThrow('Tenant and Tool description are mandatory')
  })

  it('should throw if TOOL is missing toolDescription', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const caller = createTypebot.createCaller({ user: mockUser } as any)

    await expect(
      caller({
        workspaceId: mockWorkspace.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typebot: {
          name: 'My Bot',
          settings: { general: { type: 'TOOL' } },
          tenant: 'ten-1',
          // toolDescription missing
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      })
    ).rejects.toThrow('Tenant and Tool description are mandatory')
  })

  it('should create TOOL if tenant and toolDescription provided', async () => {
    vi.mocked(prisma.typebot.create).mockResolvedValue({
      id: 'tb-1',
      workspaceId: mockWorkspace.id,
      name: 'My Bot',
      settings: { general: { type: 'TOOL' } },
      tenant: 'ten-1',
      toolDescription: 'desc',
      groups: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const caller = createTypebot.createCaller({ user: mockUser } as any)

    await expect(
      caller({
        workspaceId: mockWorkspace.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typebot: {
          name: 'My Bot',
          settings: { general: { type: 'TOOL' } },
          tenant: 'ten-1',
          toolDescription: 'desc',
        },
      })
    ).resolves.toBeDefined()
  })

  it('should create normal typebot without tenant/toolDescription', async () => {
    vi.mocked(prisma.typebot.create).mockResolvedValue({
      id: 'tb-2',
      workspaceId: mockWorkspace.id,
      name: 'Standard Bot',
      settings: { general: { type: 'default' } },
      groups: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const caller = createTypebot.createCaller({ user: mockUser } as any)

    await expect(
      caller({
        workspaceId: mockWorkspace.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typebot: {
          name: 'Standard Bot',
        },
      })
    ).resolves.toBeDefined()
  })
})
