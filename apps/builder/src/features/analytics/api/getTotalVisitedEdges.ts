import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { canReadTypebots } from '@/helpers/databaseRules'
import { totalVisitedEdgesSchema } from '@typebot.io/schemas'

export const getTotalVisitedEdges = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/typebots/{typebotId}/analytics/totalVisitedEdges',
      protect: true,
      summary: 'List total edges used in results',
      tags: ['Analytics'],
    },
  })
  .input(
    z.object({
      typebotId: z.string(),
    })
  )
  .output(
    z.object({
      totalVisitedEdges: z.array(totalVisitedEdgesSchema),
    })
  )
  .query(async ({ input: { typebotId }, ctx: { user } }) => {
    const typebot = await prisma.typebot.findFirst({
      where: canReadTypebots(typebotId, user),
      select: { id: true },
    })
    if (!typebot?.id)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Published typebot not found',
      })

    const edges = await prisma.visitedEdge.groupBy({
      by: ['edgeId'],
      where: {
        result: {
          typebotId: typebot.id,
        },
      },
      _count: { resultId: true },
    })

    return {
      totalVisitedEdges: edges.map((e) => ({
        edgeId: e.edgeId,
        total: e._count.resultId,
      })),
    }
  })
