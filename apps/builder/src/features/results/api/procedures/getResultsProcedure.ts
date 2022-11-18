import prisma from '@/lib/prisma'
import { canReadTypebot } from '@/utils/api/dbRules'
import { authenticatedProcedure } from '@/utils/server/trpc'
import { TRPCError } from '@trpc/server'
import { ResultWithAnswers, resultWithAnswersSchema } from 'models'
import { z } from 'zod'

const maxLimit = 200

export const getResultsProcedure = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/typebots/{typebotId}/results',
      protect: true,
    },
  })
  .input(
    z.object({
      typebotId: z.string(),
      limit: z.string().regex(/^[0-9]{1,3}$/),
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
        message: 'limit must be between 1 and 200',
      })
    const { cursor } = input
    const results = (await prisma.result.findMany({
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        typebot: canReadTypebot(input.typebotId, user),
        answers: { some: {} },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: { answers: true },
    })) as ResultWithAnswers[]

    let nextCursor: typeof cursor | undefined
    if (results.length > limit) {
      const nextResult = results.pop()
      nextCursor = nextResult?.id
    }

    return { results, nextCursor }
  })
