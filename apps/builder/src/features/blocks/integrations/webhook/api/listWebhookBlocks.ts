import prisma from '@sniper.io/lib/prisma'
import { canReadSnipers } from '@/helpers/databaseRules'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { parseGroups } from '@sniper.io/schemas/features/sniper/group'
import { IntegrationBlockType } from '@sniper.io/schemas/features/blocks/integrations/constants'
import { Block } from '@sniper.io/schemas'
import { isWebhookBlock } from '@sniper.io/schemas/helpers'
import { byId } from '@sniper.io/lib'

export const listWebhookBlocks = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/snipers/{sniperId}/webhookBlocks',
      protect: true,
      summary: 'List webhook blocks',
      description:
        'Returns a list of all the webhook blocks that you can subscribe to.',
      tags: ['Webhook'],
    },
  })
  .input(
    z.object({
      sniperId: z.string(),
    })
  )
  .output(
    z.object({
      webhookBlocks: z.array(
        z.object({
          id: z.string(),
          type: z.enum([
            IntegrationBlockType.WEBHOOK,
            IntegrationBlockType.ZAPIER,
            IntegrationBlockType.MAKE_COM,
            IntegrationBlockType.PABBLY_CONNECT,
          ]),
          label: z.string(),
          url: z.string().optional(),
        })
      ),
    })
  )
  .query(async ({ input: { sniperId }, ctx: { user } }) => {
    const sniper = await prisma.sniper.findFirst({
      where: canReadSnipers(sniperId, user),
      select: {
        version: true,
        groups: true,
        webhooks: true,
      },
    })
    if (!sniper)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Sniper not found' })

    const groups = parseGroups(sniper.groups, {
      sniperVersion: sniper.version,
    })

    const webhookBlocks = groups.reduce<
      {
        id: string
        label: string
        url: string | undefined
        type:
          | IntegrationBlockType.WEBHOOK
          | IntegrationBlockType.ZAPIER
          | IntegrationBlockType.MAKE_COM
          | IntegrationBlockType.PABBLY_CONNECT
      }[]
    >((webhookBlocks, group) => {
      const blocks = (group.blocks as Block[]).filter(isWebhookBlock)
      return [
        ...webhookBlocks,
        ...blocks.map((block) => ({
          id: block.id,
          type: block.type,
          label: `${group.title} > ${block.id}`,
          url:
            'webhookId' in block && !block.options?.webhook
              ? sniper?.webhooks.find(byId(block.webhookId))?.url ?? undefined
              : block.options?.webhook?.url,
        })),
      ]
    }, [])

    return { webhookBlocks }
  })
