import { Webhook as WebhookFromDb } from '@typebot.io/prisma'
import {
  BlockV5,
  PublicTypebotV5,
  TypebotV5,
  HttpRequest,
} from '@typebot.io/schemas'
import { isWebhookBlock } from '@typebot.io/schemas/helpers'
import { isDefined } from '@typebot.io/lib/utils'
import prisma from '@typebot.io/lib/prisma'
import {
  HttpMethod,
  defaultWebhookAttributes,
} from '@typebot.io/schemas/features/blocks/integrations/webhook/constants'

export const migrateTypebotFromV3ToV4 = async (
  typebot: TypebotV5 | PublicTypebotV5
): Promise<Omit<TypebotV5 | PublicTypebotV5, 'version'> & { version: '4' }> => {
  if (typebot.version === '4')
    return typebot as Omit<TypebotV5, 'version'> & { version: '4' }
  const webhookBlocks = typebot.groups
    .flatMap((group) => group.blocks)
    .filter(isWebhookBlock)
  const webhooks = await prisma.webhook.findMany({
    where: {
      id: {
        in: webhookBlocks
          .map((block) => ('webhookId' in block ? block.webhookId : undefined))
          .filter(isDefined),
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
  (block: BlockV5): BlockV5 => {
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
              method:
                (webhook.method as HttpRequest['method']) ?? HttpMethod.POST,
              headers: (webhook.headers as HttpRequest['headers']) ?? [],
              queryParams:
                (webhook.queryParams as HttpRequest['headers']) ?? [],
              body: webhook.body ?? undefined,
            }
          : {
              ...defaultWebhookAttributes,
              id: 'webhookId' in block ? block.webhookId ?? '' : '',
            },
      },
    }
  }
