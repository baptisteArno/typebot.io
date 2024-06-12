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
      path: '/v1/typebots/{typebotId}/results/{resultId}',
      protect: true,
      summary: 'Get result by id',
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
      resultId: z
        .string()
        .describe(
          'The `resultId` is returned by the /startChat endpoint or you can find it by listing results with `/results` endpoint'
        ),
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
      include: {
        answers: {
          select: {
            blockId: true,
            content: true,
            createdAt: true,
          },
        },
        answersV2: {
          select: {
            blockId: true,
            content: true,
            createdAt: true,
          },
        },
      },
    })

    if (results.length === 0)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Result not found' })

    const { answers, answersV2, ...result } = results[0]

    return {
      result: resultWithAnswersSchema.parse({
        ...result,
        answers: answers
          .concat(answersV2)
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
      }),
    }
  })
