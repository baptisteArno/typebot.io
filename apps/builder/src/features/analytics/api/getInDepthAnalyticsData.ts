import prisma from '@sniper.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { canReadSnipers } from '@/helpers/databaseRules'
import { totalAnswersSchema } from '@sniper.io/schemas/features/analytics'
import { parseGroups } from '@sniper.io/schemas'
import { isInputBlock } from '@sniper.io/schemas/helpers'
import { defaultTimeFilter, timeFilterValues } from '../constants'
import {
  parseFromDateFromTimeFilter,
  parseToDateFromTimeFilter,
} from '../helpers/parseDateFromTimeFilter'

export const getInDepthAnalyticsData = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/snipers/{sniperId}/analytics/inDepthData',
      protect: true,
      summary:
        'List total answers in blocks and off-default paths visited edges',
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
      totalAnswers: z.array(totalAnswersSchema),
      offDefaultPathVisitedEdges: z.array(
        z.object({ edgeId: z.string(), total: z.number() })
      ),
    })
  )
  .query(
    async ({ input: { sniperId, timeFilter, timeZone }, ctx: { user } }) => {
      const sniper = await prisma.sniper.findFirst({
        where: canReadSnipers(sniperId, user),
        select: { publishedSniper: true },
      })
      if (!sniper?.publishedSniper)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Published sniper not found',
        })

      const fromDate = parseFromDateFromTimeFilter(timeFilter, timeZone)
      const toDate = parseToDateFromTimeFilter(timeFilter, timeZone)

      const totalAnswersPerBlock = await prisma.answer.groupBy({
        by: ['blockId', 'resultId'],
        where: {
          result: {
            sniperId: sniper.publishedSniper.sniperId,
            createdAt: fromDate
              ? {
                  gte: fromDate,
                  lte: toDate ?? undefined,
                }
              : undefined,
          },
          blockId: {
            in: parseGroups(sniper.publishedSniper.groups, {
              sniperVersion: sniper.publishedSniper.version,
            }).flatMap((group) =>
              group.blocks.filter(isInputBlock).map((block) => block.id)
            ),
          },
        },
      })

      const totalAnswersV2PerBlock = await prisma.answerV2.groupBy({
        by: ['blockId', 'resultId'],
        where: {
          result: {
            sniperId: sniper.publishedSniper.sniperId,
            createdAt: fromDate
              ? {
                  gte: fromDate,
                  lte: toDate ?? undefined,
                }
              : undefined,
          },
          blockId: {
            in: parseGroups(sniper.publishedSniper.groups, {
              sniperVersion: sniper.publishedSniper.version,
            }).flatMap((group) =>
              group.blocks.filter(isInputBlock).map((block) => block.id)
            ),
          },
        },
      })

      const uniqueCounts = totalAnswersPerBlock
        .concat(totalAnswersV2PerBlock)
        .reduce<{
          [key: string]: Set<string>
        }>((acc, { blockId, resultId }) => {
          acc[blockId] = acc[blockId] || new Set()
          acc[blockId].add(resultId)
          return acc
        }, {})

      const offDefaultPathVisitedEdges = await prisma.visitedEdge.groupBy({
        by: ['edgeId'],
        where: {
          result: {
            sniperId: sniper.publishedSniper.sniperId,
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
        totalAnswers: Object.keys(uniqueCounts).map((blockId) => ({
          blockId,
          total: uniqueCounts[blockId].size,
        })),
        offDefaultPathVisitedEdges: offDefaultPathVisitedEdges.map((e) => ({
          edgeId: e.edgeId,
          total: e._count.resultId,
        })),
      }
    }
  )
