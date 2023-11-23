import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { resultWithAnswersSchema } from '@typebot.io/schemas'
import { z } from 'zod'
import { isReadTypebotForbidden } from '@/features/typebot/helpers/isReadTypebotForbidden'

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
    const typebot = await prisma.typebot.findUnique({
      where: {
        id: input.typebotId,
      },
      select: {
        id: true,
        groups: true,
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
        collaborators: {
          select: {
            userId: true,
            type: true,
          },
        },
      },
    })
    if (!typebot || (await isReadTypebotForbidden(typebot, user)))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Typebot not found' })
    const results = await prisma.result.findMany({
      where: {
        id: input.resultId,
        typebotId: typebot.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: { answers: true },
    })

    if (results.length === 0)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Result not found' })

    return { result: resultWithAnswersSchema.parse(results[0]) }
  })
