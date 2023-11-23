import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { resultWithAnswersSchema } from '@typebot.io/schemas'
import { z } from 'zod'
import { isReadTypebotForbidden } from '@/features/typebot/helpers/isReadTypebotForbidden'

const maxLimit = 100

export const getResults = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/typebots/{typebotId}/results',
      protect: true,
      summary: 'List results ordered by descending creation date',
      tags: ['Results'],
    },
  })
  .input(
    z.object({
      typebotId: z.string(),
      limit: z.coerce.number().min(1).max(maxLimit).default(50),
      cursor: z.string().optional(),
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
    const results = await prisma.result.findMany({
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        typebotId: typebot.id,
        hasStarted: true,
        isArchived: false,
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
