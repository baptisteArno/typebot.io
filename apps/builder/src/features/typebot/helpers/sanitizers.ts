import prisma from '@/lib/prisma'
import { Plan } from '@typebot.io/prisma'
import {
  Block,
  InputBlockType,
  IntegrationBlockType,
  Typebot,
  Webhook,
  WebhookBlock,
  defaultWebhookAttributes,
} from '@typebot.io/schemas'
import { HttpMethod } from '@typebot.io/schemas/features/blocks/integrations/webhook/enums'

export const sanitizeSettings = (
  settings: Typebot['settings'],
  workspacePlan: Plan
): Typebot['settings'] => ({
  ...settings,
  general: {
    ...settings.general,
    isBrandingEnabled:
      workspacePlan === Plan.FREE ? false : settings.general.isBrandingEnabled,
  },
})

export const sanitizeGroups =
  (workspaceId: string) =>
  async (groups: Typebot['groups']): Promise<Typebot['groups']> =>
    Promise.all(
      groups.map(async (group) => ({
        ...group,
        blocks: await Promise.all(group.blocks.map(sanitizeBlock(workspaceId))),
      }))
    )

const sanitizeBlock =
  (workspaceId: string) =>
  async (block: Block): Promise<Block> => {
    switch (block.type) {
      case InputBlockType.PAYMENT:
        return {
          ...block,
          options: {
            ...block.options,
            credentialsId: await sanitizeCredentialsId(workspaceId)(
              block.options.credentialsId
            ),
          },
        }
      case IntegrationBlockType.WEBHOOK:
        return await sanitizeWebhookBlock(block)
      case IntegrationBlockType.GOOGLE_SHEETS:
        return {
          ...block,
          options: {
            ...block.options,
            credentialsId: await sanitizeCredentialsId(workspaceId)(
              block.options.credentialsId
            ),
          },
        }
      case IntegrationBlockType.OPEN_AI:
        return {
          ...block,
          options: {
            ...block.options,
            credentialsId: await sanitizeCredentialsId(workspaceId)(
              block.options.credentialsId
            ),
          },
        }
      case IntegrationBlockType.EMAIL:
        return {
          ...block,
          options: {
            ...block.options,
            credentialsId:
              (await sanitizeCredentialsId(workspaceId)(
                block.options.credentialsId
              )) ?? 'default',
          },
        }
      default:
        return block
    }
  }

const sanitizeWebhookBlock = async (
  block: WebhookBlock
): Promise<WebhookBlock> => {
  if (!block.webhookId) return block
  const webhook = await prisma.webhook.findFirst({
    where: {
      id: block.webhookId,
    },
  })
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

const sanitizeCredentialsId =
  (workspaceId: string) =>
  async (credentialsId?: string): Promise<string | undefined> => {
    if (!credentialsId) return
    const credentials = await prisma.credentials.findFirst({
      where: {
        id: credentialsId,
        workspaceId,
      },
      select: {
        id: true,
      },
    })
    return credentials?.id
  }

export const isPublicIdNotAvailable = async (publicId: string) => {
  const typebotWithSameIdCount = await prisma.typebot.count({
    where: {
      publicId,
    },
  })
  return typebotWithSameIdCount > 0
}

export const isCustomDomainNotAvailable = async (customDomain: string) => {
  const typebotWithSameDomainCount = await prisma.typebot.count({
    where: {
      customDomain,
    },
  })

  return typebotWithSameDomainCount > 0
}
