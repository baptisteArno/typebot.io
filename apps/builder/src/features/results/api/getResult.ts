import prisma from '@sniper.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { resultWithAnswersSchema } from '@sniper.io/schemas'
import { z } from 'zod'
import { isReadSniperForbidden } from '@/features/sniper/helpers/isReadSniperForbidden'

export const getResult = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/snipers/{sniperId}/results/{resultId}',
      protect: true,
      summary: 'Get result by id',
      tags: ['Results'],
    },
  })
  .input(
    z.object({
      sniperId: z
        .string()
        .describe(
          "[Where to find my bot's ID?](../how-to#how-to-find-my-sniperid)"
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
    const sniper = await prisma.sniper.findUnique({
      where: {
        id: input.sniperId,
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
    if (!sniper || (await isReadSniperForbidden(sniper, user)))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Sniper not found' })
    const results = await prisma.result.findMany({
      where: {
        id: input.resultId,
        sniperId: sniper.id,
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
