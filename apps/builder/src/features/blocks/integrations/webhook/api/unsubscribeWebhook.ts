import prisma from '@sniper.io/lib/prisma'
import { canWriteSnipers } from '@/helpers/databaseRules'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Block, HttpRequestBlock, parseGroups } from '@sniper.io/schemas'
import { byId } from '@sniper.io/lib'
import { isWebhookBlock } from '@sniper.io/schemas/helpers'
import { z } from 'zod'

export const unsubscribeWebhook = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/snipers/{sniperId}/webhookBlocks/{blockId}/unsubscribe',
      protect: true,
      summary: 'Unsubscribe from webhook block',
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
      id: z.string(),
      url: z.string().nullable(),
    })
  )
  .query(async ({ input: { sniperId, blockId }, ctx: { user } }) => {
    const sniper = await prisma.sniper.findFirst({
      where: canWriteSnipers(sniperId, user),
      select: {
        version: true,
        groups: true,
      },
    })

    if (!sniper)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Sniper not found' })

    const groups = parseGroups(sniper.groups, {
      sniperVersion: sniper.version,
    })

    const webhookBlock = groups
      .flatMap<Block>((g) => g.blocks)
      .find(byId(blockId)) as HttpRequestBlock | null

    if (!webhookBlock || !isWebhookBlock(webhookBlock))
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Webhook block not found',
      })

    if (webhookBlock.options?.webhook || sniper.version === '6') {
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
                          url: undefined,
                        },
                      },
                    }
              ),
            }
          : group
      )
      await prisma.sniper.updateMany({
        where: { id: sniperId },
        data: {
          groups: updatedGroups,
        },
      })
    } else {
      if ('webhookId' in webhookBlock)
        await prisma.webhook.update({
          where: { id: webhookBlock.webhookId },
          data: { url: null },
        })
      else
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Webhook block not found',
        })
    }

    return {
      id: blockId,
      url: null,
    }
  })
