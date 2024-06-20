import {
  CollaborationType,
  Plan,
  Prisma,
  User,
  WorkspaceRole,
} from '@sniper.io/prisma'
import prisma from '@sniper.io/lib/prisma'
import { NextApiResponse } from 'next'
import { forbidden } from '@sniper.io/lib/api'
import { env } from '@sniper.io/env'

export const canWriteSnipers = (
  sniperIds: string[] | string,
  user: Pick<User, 'email' | 'id'>
): Prisma.SniperWhereInput =>
  env.NEXT_PUBLIC_E2E_TEST
    ? { id: typeof sniperIds === 'string' ? sniperIds : { in: sniperIds } }
    : {
        id: typeof sniperIds === 'string' ? sniperIds : { in: sniperIds },
        OR: [
          {
            workspace: {
              members: {
                some: { userId: user.id, role: { not: WorkspaceRole.GUEST } },
              },
            },
          },
          {
            collaborators: {
              some: { userId: user.id, type: { not: CollaborationType.READ } },
            },
          },
        ],
      }

export const canReadSnipers = (
  sniperIds: string | string[],
  user: Pick<User, 'email' | 'id'>
) => ({
  id: typeof sniperIds === 'string' ? sniperIds : { in: sniperIds },
  workspace:
    env.ADMIN_EMAIL?.some((email) => email === user.email) ||
    env.NEXT_PUBLIC_E2E_TEST
      ? undefined
      : {
          members: {
            some: { userId: user.id },
          },
        },
})

export const canEditGuests = (user: User, sniperId: string) => ({
  id: sniperId,
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

export const isUniqueConstraintError = (error: unknown) =>
  typeof error === 'object' &&
  error &&
  'code' in error &&
  error.code === 'P2002'
