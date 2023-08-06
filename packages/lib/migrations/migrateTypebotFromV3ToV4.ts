import { PrismaClient, Webhook as WebhookFromDb } from '@typebot.io/prisma'
import {
  Block,
  Typebot,
  Webhook,
  defaultWebhookAttributes,
} from '@typebot.io/schemas'
import { isWebhookBlock } from '../utils'
import { HttpMethod } from '@typebot.io/schemas/features/blocks/integrations/webhook/enums'

export const migrateTypebotFromV3ToV4 =
  (prisma: PrismaClient) =>
  async (
    typebot: Typebot
  ): Promise<Omit<Typebot, 'version'> & { version: '4' }> => {
    if (typebot.version === '4')
      return typebot as Omit<Typebot, 'version'> & { version: '4' }
    const webhookBlocks = typebot.groups
      .flatMap((group) => group.blocks)
      .filter(isWebhookBlock)
    const webhooks = await prisma.webhook.findMany({
      where: {
        id: {
          in: webhookBlocks.map((block) => block.webhookId as string),
        },
      },
    })
    return {
      ...typebot,
      version: '4',
      groups: typebot.groups.map((group) => ({
        ...group,
        blocks: group.blocks.map(migrateWebhookBlock(webhooks)),
      })),
    }
  }

const migrateWebhookBlock =
  (webhooks: WebhookFromDb[]) =>
  (block: Block): Block => {
    if (!isWebhookBlock(block)) return block
    const webhook = webhooks.find((webhook) => webhook.id === block.webhookId)
    return {
      ...block,
      webhookId: undefined,
      options: {
        ...block.options,
        webhook: webhook
          ? {
              id: webhook.id,
              url: webhook.url ?? undefined,
              method: (webhook.method as Webhook['method']) ?? HttpMethod.POST,
              headers: (webhook.headers as Webhook['headers']) ?? [],
              queryParams: (webhook.queryParams as Webhook['headers']) ?? [],
              body: webhook.body ?? undefined,
            }
          : {
              ...defaultWebhookAttributes,
              id: block.webhookId ?? '',
            },
      },
    }
  }
