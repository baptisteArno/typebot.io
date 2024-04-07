import prisma from '@typebot.io/lib/prisma'
import { canWriteTypebots } from '@/helpers/databaseRules'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Block, HttpRequestBlock, parseGroups } from '@typebot.io/schemas'
import { byId } from '@typebot.io/lib'
import { isWebhookBlock } from '@typebot.io/schemas/helpers'
import { z } from 'zod'

export const subscribeWebhook = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/typebots/{typebotId}/webhookBlocks/{blockId}/subscribe',
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
    const typebot = await prisma.typebot.findFirst({
      where: canWriteTypebots(typebotId, user),
      select: {
        version: true,
        groups: true,
      },
    })

    if (!typebot)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Typebot not found' })

    const groups = parseGroups(typebot.groups, {
      typebotVersion: typebot.version,
    })

    const webhookBlock = groups
      .flatMap<Block>((g) => g.blocks)
      .find(byId(blockId)) as HttpRequestBlock | null

    if (!webhookBlock || !isWebhookBlock(webhookBlock))
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Webhook block not found',
      })

    if (webhookBlock.options?.webhook || typebot.version === '6') {
      const updatedGroups = groups.map((group) =>
        group.blocks.some((b) => b.id === webhookBlock.id)
          ? {
              ...group,
              blocks: group.blocks.map((block) =>
                block.id !== webhookBlock.id
                  ? block
                  : {
                      ...block,
                      options: {
                        ...webhookBlock.options,
                        webhook: {
                          ...webhookBlock.options?.webhook,
                          url,
                        },
                      },
                    }
              ),
            }
          : group
      )
      await prisma.typebot.updateMany({
        where: { id: typebotId },
        data: {
          groups: updatedGroups,
        },
      })
    } else {
      if ('webhookId' in webhookBlock)
        await prisma.webhook.update({
          where: { id: webhookBlock.webhookId },
          data: { url },
        })
      else
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Webhook block not found',
        })
    }

    return {
      id: blockId,
      url,
    }
  })
