import prisma from '@typebot.io/lib/prisma'
import { canReadTypebots } from '@/helpers/databaseRules'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { parseGroups } from '@typebot.io/schemas/features/typebot/group'
import { IntegrationBlockType } from '@typebot.io/schemas/features/blocks/integrations/constants'
import { Block } from '@typebot.io/schemas'
import { isWebhookBlock } from '@typebot.io/schemas/helpers'
import { byId } from '@typebot.io/lib'

export const listWebhookBlocks = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/typebots/{typebotId}/webhookBlocks',
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
    const typebot = await prisma.typebot.findFirst({
      where: canReadTypebots(typebotId, user),
      select: {
        version: true,
        groups: true,
        webhooks: true,
      },
    })
    if (!typebot)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Typebot not found' })

    const groups = parseGroups(typebot.groups, {
      typebotVersion: typebot.version,
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
              ? typebot?.webhooks.find(byId(block.webhookId))?.url ?? undefined
              : block.options?.webhook?.url,
        })),
      ]
    }, [])

    return { webhookBlocks }
  })
