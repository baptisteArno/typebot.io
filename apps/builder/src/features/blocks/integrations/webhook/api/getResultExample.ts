import prisma from '@/lib/prisma'
import { canReadTypebots } from '@/helpers/databaseRules'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Typebot, Webhook } from '@typebot.io/schemas'
import { z } from 'zod'
import { fetchLinkedTypebots } from '@/features/blocks/logic/typebotLink/helpers/fetchLinkedTypebots'
import { parseResultExample } from '../helpers/parseResultExample'

export const getResultExample = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/typebots/{typebotId}/webhookBlocks/{blockId}/getResultExample',
      protect: true,
      summary: 'Get result example',
      description:
        'Returns "fake" result for webhook block to help you anticipate how the webhook will behave.',
      tags: ['Webhook'],
    },
  })
  .input(
    z.object({
      typebotId: z.string(),
      blockId: z.string(),
    })
  )
  .output(
    z.object({
      resultExample: z
        .object({
          message: z.literal(
            'This is a sample result, it has been generated ⬇️'
          ),
          'Submitted at': z.string(),
        })
        .and(z.record(z.string().optional()))
        .describe('Can contain any fields.'),
    })
  )
  .query(async ({ input: { typebotId, blockId }, ctx: { user } }) => {
    const typebot = (await prisma.typebot.findFirst({
      where: canReadTypebots(typebotId, user),
      select: {
        groups: true,
        edges: true,
        variables: true,
        webhooks: true,
      },
    })) as
      | (Pick<Typebot, 'groups' | 'edges' | 'variables'> & {
          webhooks: Webhook[]
        })
      | null

    if (!typebot)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Typebot not found' })

    const block = typebot.groups
      .flatMap((g) => g.blocks)
      .find((s) => s.id === blockId)

    if (!block)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Block not found' })

    const linkedTypebots = await fetchLinkedTypebots(typebot, user)

    return {
      resultExample: await parseResultExample(
        typebot,
        linkedTypebots
      )(block.groupId),
    }
  })
