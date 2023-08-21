import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isReadWorkspaceFobidden } from '@/features/workspace/helpers/isReadWorkspaceFobidden'

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
      },
      select: {
        members: {
          select: {
            userId: true,
          },
        },
        typebots: {
          select: { id: true },
        },
      },
    })
    if (!workspace || isReadWorkspaceFobidden(workspace, user))
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Workspace not found',
      })

    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const totalChatsUsed = await prisma.result.count({
      where: {
        typebotId: { in: workspace.typebots.map((typebot) => typebot.id) },
        hasStarted: true,
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    })
    const {
      _sum: { storageUsed: totalStorageUsed },
    } = await prisma.answer.aggregate({
      where: {
        storageUsed: { gt: 0 },
        result: {
          typebotId: { in: workspace.typebots.map((typebot) => typebot.id) },
        },
      },
      _sum: { storageUsed: true },
    })

    return {
      totalChatsUsed,
      totalStorageUsed: totalStorageUsed ?? 0,
    }
  })
