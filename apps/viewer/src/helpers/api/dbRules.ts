import {
  CollaborationType,
  Prisma,
  User,
  WorkspaceRole,
} from '@typebot.io/prisma'
import { env } from '@typebot.io/env'

const parseWhereFilter = (
  typebotIds: string[] | string,
  user: User,
  type: 'read' | 'write'
): Prisma.TypebotWhereInput => ({
  OR: [
    {
      id: typeof typebotIds === 'string' ? typebotIds : { in: typebotIds },
      collaborators: {
        some: {
          userId: user.id,
          type: type === 'write' ? CollaborationType.WRITE : undefined,
        },
      },
    },
    {
      id: typeof typebotIds === 'string' ? typebotIds : { in: typebotIds },
      workspace:
        (type === 'read' && user.email === env.ADMIN_EMAIL) ||
        env.NEXT_PUBLIC_E2E_TEST
          ? undefined
          : {
              members: {
                some: { userId: user.id, role: { not: WorkspaceRole.GUEST } },
              },
            },
    },
  ],
})

export const canReadTypebot = (typebotId: string, user: User) =>
  parseWhereFilter(typebotId, user, 'read')

export const canWriteTypebot = (typebotId: string, user: User) =>
  parseWhereFilter(typebotId, user, 'write')

export const canReadTypebots = (typebotIds: string[], user: User) =>
  parseWhereFilter(typebotIds, user, 'read')

export const canWriteTypebots = (typebotIds: string[], user: User) =>
  parseWhereFilter(typebotIds, user, 'write')

export const canEditGuests = (user: User, typebotId: string) => ({
  id: typebotId,
  workspace: {
    members: {
      some: { userId: user.id, role: { not: WorkspaceRole.GUEST } },
    },
  },
})
