import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isReadTypebotForbidden } from '@/features/typebot/helpers/isReadTypebotForbidden'
import { Stats, statsSchema } from '@typebot.io/schemas'
import { defaultTimeFilter, timeFilterValues } from '../constants'
import {
  parseFromDateFromTimeFilter,
  parseToDateFromTimeFilter,
} from '../helpers/parseDateFromTimeFilter'

export const getStats = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/typebots/{typebotId}/analytics/stats',
      protect: true,
      summary: 'Get results stats',
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
  .output(z.object({ stats: statsSchema }))
  .query(
    async ({ input: { typebotId, timeFilter, timeZone }, ctx: { user } }) => {
      const typebot = await prisma.typebot.findUnique({
        where: { id: typebotId },
        select: {
          id: true,
          publishedTypebot: true,
          collaborators: { select: { userId: true } },
          workspace: {
            select: {
              id: true,
              isSuspended: true,
              isPastDue: true,
              members: { select: { userId: true } },
            },
          },
        },
      })
      if (!typebot || (await isReadTypebotForbidden(typebot, user)))
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Typebot not found' })
      if (!typebot.publishedTypebot)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Published typebot not found',
        })

      const fromDate = parseFromDateFromTimeFilter(timeFilter, timeZone)
      const toDate = parseToDateFromTimeFilter(timeFilter, timeZone)

      const [totalViews, totalStarts, totalCompleted] =
        await prisma.$transaction([
          prisma.result.count({
            where: {
              typebotId: typebot.id,
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
              typebotId: typebot.id,
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
              typebotId: typebot.id,
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
