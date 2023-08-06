import prisma from '@/lib/prisma'
import { canWriteTypebots } from '@/helpers/databaseRules'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Typebot, WebhookBlock } from '@typebot.io/schemas'
import { byId, isWebhookBlock } from '@typebot.io/lib'
import { z } from 'zod'
import { HttpMethod } from '@typebot.io/schemas/features/blocks/integrations/webhook/enums'

export const subscribeWebhook = authenticatedProcedure
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
      },
    })) as Pick<Typebot, 'groups'> | null

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

    const newWebhook = {
      id: webhookBlock.webhookId ?? webhookBlock.id,
      url,
      body: '{{state}}',
      method: HttpMethod.POST,
      headers: [],
      queryParams: [],
    }

    if (webhookBlock.webhookId)
      await prisma.webhook.upsert({
        where: { id: webhookBlock.webhookId },
        update: { url, body: newWebhook.body, method: newWebhook.method },
        create: {
          typebotId,
          ...newWebhook,
        },
      })
    else {
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
                        webhook: newWebhook,
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
      url,
    }
  })
