import prisma from '@sniper.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { canReadSnipers } from '@/helpers/databaseRules'
import { totalVisitedEdgesSchema } from '@sniper.io/schemas'
import { defaultTimeFilter, timeFilterValues } from '../constants'
import {
  parseFromDateFromTimeFilter,
  parseToDateFromTimeFilter,
} from '../helpers/parseDateFromTimeFilter'

export const getTotalVisitedEdges = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/snipers/{sniperId}/analytics/totalVisitedEdges',
      protect: true,
      summary: 'List total edges used in results',
      tags: ['Analytics'],
    },
  })
  .input(
    z.object({
      sniperId: z.string(),
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
    async ({ input: { sniperId, timeFilter, timeZone }, ctx: { user } }) => {
      const sniper = await prisma.sniper.findFirst({
        where: canReadSnipers(sniperId, user),
        select: { id: true },
      })
      if (!sniper?.id)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Published sniper not found',
        })

      const fromDate = parseFromDateFromTimeFilter(timeFilter, timeZone)
      const toDate = parseToDateFromTimeFilter(timeFilter, timeZone)

      const edges = await prisma.visitedEdge.groupBy({
        by: ['edgeId'],
        where: {
          result: {
            sniperId: sniper.id,
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
