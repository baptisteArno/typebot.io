import prisma from '@/lib/prisma'
import { canReadTypebots } from '@/helpers/databaseRules'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Group, IntegrationBlockType, Typebot } from '@typebot.io/schemas'
import { byId, isWebhookBlock, parseGroupTitle } from '@typebot.io/lib'
import { z } from 'zod'
import { Webhook } from '@typebot.io/prisma'

export const listWebhookBlocks = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/typebots/{typebotId}/webhookBlocks',
      protect: true,
      summary: 'List webhook blocks',
      description:
        'Returns a list of all the webhook blocks that you can subscribe to.',
      tags: ['Webhook'],
    },
  })
  .input(
    z.object({
      typebotId: z.string(),
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
  .query(async ({ input: { typebotId }, ctx: { user } }) => {
    const typebot = (await prisma.typebot.findFirst({
      where: canReadTypebots(typebotId, user),
      select: {
        groups: true,
        webhooks: true,
      },
    })) as (Pick<Typebot, 'groups'> & { webhooks: Webhook[] }) | null
    if (!typebot)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Typebot not found' })

    const webhookBlocks = (typebot?.groups as Group[]).reduce<
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
      const blocks = group.blocks.filter(isWebhookBlock)
      return [
        ...webhookBlocks,
        ...blocks.map((block) => ({
          id: block.id,
          type: block.type,
          label: `${parseGroupTitle(group.title)} > ${block.id}`,
          url: block.options.webhook
            ? block.options.webhook.url
            : typebot?.webhooks.find(byId(block.webhookId))?.url ?? undefined,
        })),
      ]
    }, [])

    return { webhookBlocks }
  })
