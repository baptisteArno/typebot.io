import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { canReadTypebots } from '@/helpers/databaseRules'
import { totalAnswersSchema } from '@typebot.io/schemas/features/analytics'
import { parseGroups } from '@typebot.io/schemas'
import { isInputBlock } from '@typebot.io/lib'

export const getTotalAnswers = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/typebots/{typebotId}/analytics/totalAnswersInBlocks',
      protect: true,
      summary: 'List total answers in blocks',
      tags: ['Analytics'],
    },
  })
  .input(
    z.object({
      typebotId: z.string(),
    })
  )
  .output(z.object({ totalAnswers: z.array(totalAnswersSchema) }))
  .query(async ({ input: { typebotId }, ctx: { user } }) => {
    const typebot = await prisma.typebot.findFirst({
      where: canReadTypebots(typebotId, user),
      select: { publishedTypebot: true },
    })
    if (!typebot?.publishedTypebot)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Published typebot not found',
      })

    const totalAnswersPerBlock = await prisma.answer.groupBy({
      by: ['blockId'],
      where: {
        result: {
          typebotId: typebot.publishedTypebot.typebotId,
        },
        blockId: {
          in: parseGroups(typebot.publishedTypebot.groups, {
            typebotVersion: typebot.publishedTypebot.version,
          }).flatMap((group) =>
            group.blocks.filter(isInputBlock).map((block) => block.id)
          ),
        },
      },
      _count: { _all: true },
    })

    return {
      totalAnswers: totalAnswersPerBlock.map((a) => ({
        blockId: a.blockId,
        total: a._count._all,
      })),
    }
  })
