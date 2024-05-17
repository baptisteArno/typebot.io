import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { canReadTypebots } from '@/helpers/databaseRules'
import { totalVisitedEdgesSchema } from '@typebot.io/schemas'
import { defaultTimeFilter, timeFilterValues } from '../constants'
import {
  parseFromDateFromTimeFilter,
  parseToDateFromTimeFilter,
} from '../helpers/parseDateFromTimeFilter'

export const getTotalVisitedEdges = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/typebots/{typebotId}/analytics/totalVisitedEdges',
      protect: true,
      summary: 'List total edges used in results',
      tags: ['Analytics'],
    },
  })
  .input(
    z.object({
      typebotId: z.string(),
      timeFilter: z.enum(timeFilterValues).default(defaultTimeFilter),
      timeZone: z.string().optional(),
    })
  )
  .output(
    z.object({
      totalVisitedEdges: z.array(totalVisitedEdgesSchema),
    })
  )
  .query(
    async ({ input: { typebotId, timeFilter, timeZone }, ctx: { user } }) => {
      const typebot = await prisma.typebot.findFirst({
        where: canReadTypebots(typebotId, user),
        select: { id: true },
      })
      if (!typebot?.id)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Published typebot not found',
        })

      const fromDate = parseFromDateFromTimeFilter(timeFilter, timeZone)
      const toDate = parseToDateFromTimeFilter(timeFilter, timeZone)

      const edges = await prisma.visitedEdge.groupBy({
        by: ['edgeId'],
        where: {
          result: {
            typebotId: typebot.id,
            createdAt: fromDate
              ? {
                  gte: fromDate,
                  lte: toDate ?? undefined,
                }
              : undefined,
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
    }
  )
