import { getTypebot } from '@/features/typebot/helpers/getTypebot'
import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { ResultWithAnswers, resultWithAnswersSchema } from '@typebot.io/schemas'
import { z } from 'zod'

export const getResult = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/typebots/{typebotId}/results/{resultId}',
      protect: true,
      summary: 'Get result by id',
      tags: ['Results'],
    },
  })
  .input(
    z.object({
      typebotId: z.string(),
      resultId: z.string(),
    })
  )
  .output(
    z.object({
      result: resultWithAnswersSchema,
    })
  )
  .query(async ({ input, ctx: { user } }) => {
    const typebot = await getTypebot({
      accessLevel: 'read',
      user,
      typebotId: input.typebotId,
    })
    if (!typebot?.id)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Typebot not found' })
    const results = (await prisma.result.findMany({
      where: {
        id: input.resultId,
        typebotId: typebot.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: { answers: true },
    })) as ResultWithAnswers[]

    if (results.length === 0)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Result not found' })

    return { result: results[0] }
  })
