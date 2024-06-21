import { Webhook as WebhookFromDb } from '@sniper.io/prisma'
import {
  BlockV5,
  PublicSniperV5,
  SniperV5,
  HttpRequest,
} from '@sniper.io/schemas'
import { isWebhookBlock } from '@sniper.io/schemas/helpers'
import { isDefined } from '@sniper.io/lib/utils'
import prisma from '@sniper.io/lib/prisma'
import {
  HttpMethod,
  defaultWebhookAttributes,
} from '@sniper.io/schemas/features/blocks/integrations/webhook/constants'

export const migrateSniperFromV3ToV4 = async (
  sniper: SniperV5 | PublicSniperV5
): Promise<Omit<SniperV5 | PublicSniperV5, 'version'> & { version: '4' }> => {
  if (sniper.version === '4')
    return sniper as Omit<SniperV5, 'version'> & { version: '4' }
  const webhookBlocks = sniper.groups
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
    ...sniper,
    version: '4',
    groups: sniper.groups.map((group) => ({
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
