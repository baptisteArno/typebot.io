import { CollaborationType, Plan, Prisma, User, WorkspaceRole } from 'db'
import prisma from '@/lib/prisma'
import { NextApiResponse } from 'next'
import { env, isNotEmpty } from 'utils'
import { forbidden } from 'utils/api'

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
        (type === 'read' && user.email === process.env.ADMIN_EMAIL) ||
        isNotEmpty(env('E2E_TEST'))
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

export const canPublishFileInput = async ({
  userId,
  workspaceId,
  res,
}: {
  userId: string
  workspaceId: string
  res: NextApiResponse
}) => {
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, members: { some: { userId } } },
    select: { plan: true },
  })
  if (!workspace) {
    forbidden(res, 'workspace not found')
    return false
  }
  if (workspace?.plan === Plan.FREE) {
    forbidden(res, 'You need to upgrade your plan to use file input blocks')
    return false
  }
  return true
}
