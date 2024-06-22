import prisma from '@sniper.io/lib/prisma'
import { canReadSnipers } from '@/helpers/databaseRules'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Sniper } from '@sniper.io/schemas'
import { z } from 'zod'
import { fetchLinkedSnipers } from '@/features/blocks/logic/sniperLink/helpers/fetchLinkedSnipers'
import { parseSampleResult } from '@sniper.io/bot-engine/blocks/integrations/webhook/parseSampleResult'
import { getBlockById } from '@sniper.io/schemas/helpers'

export const getResultExample = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/snipers/{sniperId}/webhookBlocks/{blockId}/getResultExample',
      protect: true,
      summary: 'Get result example',
      description:
        'Returns "fake" result for webhook block to help you anticipate how the webhook will behave.',
      tags: ['Webhook'],
    },
  })
  .input(
    z.object({
      sniperId: z.string(),
      blockId: z.string(),
    })
  )
  .output(
    z.object({
      resultExample: z.record(z.any()).describe('Can contain any fields.'),
    })
  )
  .query(async ({ input: { sniperId, blockId }, ctx: { user } }) => {
    const sniper = (await prisma.sniper.findFirst({
      where: canReadSnipers(sniperId, user),
      select: {
        groups: true,
        edges: true,
        variables: true,
        events: true,
      },
    })) as Pick<Sniper, 'groups' | 'edges' | 'variables' | 'events'> | null

    if (!sniper)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Sniper not found' })

    const { group } = getBlockById(blockId, sniper.groups)

    if (!group)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Block not found' })

    const linkedSnipers = await fetchLinkedSnipers(sniper, user)

    return {
      resultExample: await parseSampleResult(
        sniper,
        linkedSnipers,
        user.email ?? undefined
      )(group.id, sniper.variables),
    }
  })
