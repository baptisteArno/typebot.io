import prisma from '@/lib/prisma'
import { canWriteTypebots } from '@/utils/api/dbRules'
import { authenticatedProcedure } from '@/utils/server/trpc'
import { TRPCError } from '@trpc/server'
import { Typebot, Webhook, WebhookBlock } from 'models'
import { byId, isWebhookBlock } from 'utils'
import { z } from 'zod'

export const subscribeWebhookProcedure = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/typebots/{typebotId}/webhookBlocks/{blockId}/subscribe',
      protect: true,
      summary: 'Subscribe to webhook block',
      tags: ['Webhook'],
    },
  })
  .input(
    z.object({
      typebotId: z.string(),
      blockId: z.string(),
      url: z.string(),
    })
  )
  .output(
    z.object({
      id: z.string(),
      url: z.string().nullable(),
    })
  )
  .query(async ({ input: { typebotId, blockId, url }, ctx: { user } }) => {
    const typebot = (await prisma.typebot.findFirst({
      where: canWriteTypebots(typebotId, user),
      select: {
        groups: true,
        webhooks: true,
      },
    })) as (Pick<Typebot, 'groups'> & { webhooks: Webhook[] }) | null

    if (!typebot)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Typebot not found' })

    const webhookBlock = typebot.groups
      .flatMap((g) => g.blocks)
      .find(byId(blockId)) as WebhookBlock | null

    if (!webhookBlock || !isWebhookBlock(webhookBlock))
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Webhook block not found',
      })

    await prisma.webhook.upsert({
      where: { id: webhookBlock.webhookId },
      update: { url, body: '{{state}}', method: 'POST' },
      create: { url, body: '{{state}}', method: 'POST', typebotId },
    })

    return {
      id: blockId,
      url,
    }
  })
