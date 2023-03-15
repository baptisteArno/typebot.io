import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const getUsage = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/billing/usage',
      protect: true,
      summary: 'Get current plan usage',
      tags: ['Billing'],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
    })
  )
  .output(
    z.object({ totalChatsUsed: z.number(), totalStorageUsed: z.number() })
  )
  .query(async ({ input: { workspaceId }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        members: { some: { userId: user.id } },
      },
    })
    if (!workspace)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Workspace not found',
      })

    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayOfNextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    )
    const [
      totalChatsUsed,
      {
        _sum: { storageUsed: totalStorageUsed },
      },
    ] = await prisma.$transaction(async (tx) => {
      const typebots = await tx.typebot.findMany({
        where: {
          workspace: {
            id: workspaceId,
          },
        },
      })

      return Promise.all([
        prisma.result.count({
          where: {
            typebotId: { in: typebots.map((typebot) => typebot.id) },
            hasStarted: true,
            createdAt: {
              gte: firstDayOfMonth,
              lt: firstDayOfNextMonth,
            },
          },
        }),
        prisma.answer.aggregate({
          where: {
            storageUsed: { gt: 0 },
            result: {
              typebotId: { in: typebots.map((typebot) => typebot.id) },
            },
          },
          _sum: { storageUsed: true },
        }),
      ])
    })

    return {
      totalChatsUsed,
      totalStorageUsed: totalStorageUsed ?? 0,
    }
  })
