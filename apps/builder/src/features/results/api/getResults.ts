import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { resultWithAnswersSchema } from '@typebot.io/schemas'
import { z } from 'zod'
import { isReadTypebotForbidden } from '@/features/typebot/helpers/isReadTypebotForbidden'
import {
  timeFilterValues,
  defaultTimeFilter,
} from '@/features/analytics/constants'
import { parseDateFromTimeFilter } from '@/features/analytics/helpers/parseDateFromTimeFilter'

const maxLimit = 100

export const getResults = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/typebots/{typebotId}/results',
      protect: true,
      summary: 'List results ordered by descending creation date',
      tags: ['Results'],
    },
  })
  .input(
    z.object({
      typebotId: z
        .string()
        .describe(
          "[Where to find my bot's ID?](../how-to#how-to-find-my-typebotid)"
        ),
      limit: z.coerce.number().min(1).max(maxLimit).default(50),
      cursor: z.string().optional(),
      timeFilter: z.enum(timeFilterValues).default(defaultTimeFilter),
    })
  )
  .output(
    z.object({
      results: z.array(resultWithAnswersSchema),
      nextCursor: z.string().nullish(),
    })
  )
  .query(async ({ input, ctx: { user } }) => {
    const limit = Number(input.limit)
    if (limit < 1 || limit > maxLimit)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `limit must be between 1 and ${maxLimit}`,
      })
    const { cursor } = input
    const typebot = await prisma.typebot.findUnique({
      where: {
        id: input.typebotId,
      },
      select: {
        id: true,
        groups: true,
        collaborators: {
          select: {
            userId: true,
            type: true,
          },
        },
        workspace: {
          select: {
            isSuspended: true,
            isPastDue: true,
            members: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    })
    if (!typebot || (await isReadTypebotForbidden(typebot, user)))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Typebot not found' })

    const date = parseDateFromTimeFilter(input.timeFilter)

    const results = await prisma.result.findMany({
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        typebotId: typebot.id,
        hasStarted: true,
        isArchived: false,
        createdAt: date
          ? {
              gte: date,
            }
          : undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: { answers: true },
    })

    let nextCursor: typeof cursor | undefined
    if (results.length > limit) {
      const nextResult = results.pop()
      nextCursor = nextResult?.id
    }

    return {
      results: z.array(resultWithAnswersSchema).parse(results),
      nextCursor,
    }
  })
