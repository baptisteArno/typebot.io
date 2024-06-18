import prisma from '@sniper.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { canReadSnipers } from '@/helpers/databaseRules'
import { Stats, statsSchema } from '@sniper.io/schemas'
import { defaultTimeFilter, timeFilterValues } from '../constants'
import {
  parseFromDateFromTimeFilter,
  parseToDateFromTimeFilter,
} from '../helpers/parseDateFromTimeFilter'

export const getStats = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/snipers/{sniperId}/analytics/stats',
      protect: true,
      summary: 'Get results stats',
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
  .output(z.object({ stats: statsSchema }))
  .query(
    async ({ input: { sniperId, timeFilter, timeZone }, ctx: { user } }) => {
      const sniper = await prisma.sniper.findFirst({
        where: canReadSnipers(sniperId, user),
        select: { publishedSniper: true, id: true },
      })
      if (!sniper?.publishedSniper)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Published sniper not found',
        })

      const fromDate = parseFromDateFromTimeFilter(timeFilter, timeZone)
      const toDate = parseToDateFromTimeFilter(timeFilter, timeZone)

      const [totalViews, totalStarts, totalCompleted] =
        await prisma.$transaction([
          prisma.result.count({
            where: {
              sniperId: sniper.id,
              isArchived: false,
              createdAt: fromDate
                ? {
                    gte: fromDate,
                    lte: toDate ?? undefined,
                  }
                : undefined,
            },
          }),
          prisma.result.count({
            where: {
              sniperId: sniper.id,
              isArchived: false,
              hasStarted: true,
              createdAt: fromDate
                ? {
                    gte: fromDate,
                    lte: toDate ?? undefined,
                  }
                : undefined,
            },
          }),
          prisma.result.count({
            where: {
              sniperId: sniper.id,
              isArchived: false,
              isCompleted: true,
              createdAt: fromDate
                ? {
                    gte: fromDate,
                    lte: toDate ?? undefined,
                  }
                : undefined,
            },
          }),
        ])

      const stats: Stats = {
        totalViews,
        totalStarts,
        totalCompleted,
      }

      return {
        stats,
      }
    }
  )
