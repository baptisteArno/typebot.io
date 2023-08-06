import prisma from '@/lib/prisma'
import { canWriteTypebots } from '@/helpers/databaseRules'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Typebot, Webhook, WebhookBlock } from '@typebot.io/schemas'
import { byId, isWebhookBlock } from '@typebot.io/lib'
import { z } from 'zod'

export const unsubscribeWebhook = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/typebots/{typebotId}/webhookBlocks/{blockId}/unsubscribe',
      protect: true,
      summary: 'Unsubscribe from webhook block',
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
      id: z.string(),
      url: z.string().nullable(),
    })
  )
  .query(async ({ input: { typebotId, blockId }, ctx: { user } }) => {
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

    if (webhookBlock.webhookId)
      await prisma.webhook.update({
        where: { id: webhookBlock.webhookId },
        data: { url: null },
      })
    else {
      if (!webhookBlock.options.webhook)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Webhook block not found',
        })
      const updatedGroups = typebot.groups.map((group) =>
        group.id !== webhookBlock.groupId
          ? group
          : {
              ...group,
              blocks: group.blocks.map((block) =>
                block.id !== webhookBlock.id
                  ? block
                  : {
                      ...block,
                      options: {
                        ...webhookBlock.options,
                        webhook: {
                          ...webhookBlock.options.webhook,
                          url: undefined,
                        },
                      },
                    }
              ),
            }
      )
      await prisma.typebot.updateMany({
        where: { id: typebotId },
        data: {
          groups: updatedGroups,
        },
      })
    }

    return {
      id: blockId,
      url: null,
    }
  })
