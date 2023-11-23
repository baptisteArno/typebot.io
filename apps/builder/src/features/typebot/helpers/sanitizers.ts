import prisma from '@typebot.io/lib/prisma'
import { Plan } from '@typebot.io/prisma'
import { Block, Typebot } from '@typebot.io/schemas'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { IntegrationBlockType } from '@typebot.io/schemas/features/blocks/integrations/constants'
import { defaultSendEmailOptions } from '@typebot.io/schemas/features/blocks/integrations/sendEmail/constants'

export const sanitizeSettings = (
  settings: Typebot['settings'],
  workspacePlan: Plan,
  mode: 'create' | 'update'
): Typebot['settings'] => ({
  ...settings,
  publicShare: mode === 'create' ? undefined : settings.publicShare,
  general:
    workspacePlan === Plan.FREE || settings.general
      ? {
          ...settings.general,
          isBrandingEnabled:
            workspacePlan === Plan.FREE
              ? true
              : settings.general?.isBrandingEnabled,
        }
      : undefined,
  whatsApp: settings.whatsApp
    ? {
        ...settings.whatsApp,
        isEnabled:
          mode === 'create'
            ? false
            : workspacePlan === Plan.FREE
            ? false
            : settings.whatsApp.isEnabled,
      }
    : undefined,
})

export const sanitizeGroups =
  (workspaceId: string) =>
  async (groups: Typebot['groups']): Promise<Typebot['groups']> =>
    Promise.all(
      groups.map(async (group) => ({
        ...group,
        blocks: await Promise.all(group.blocks.map(sanitizeBlock(workspaceId))),
      }))
    ) as Promise<Typebot['groups']>

const sanitizeBlock =
  (workspaceId: string) =>
  async (block: Block): Promise<Block> => {
    if (!('options' in block) || !block.options) return block
    switch (block.type) {
      case InputBlockType.PAYMENT:
        return {
          ...block,
          options: {
            ...block.options,
            credentialsId: await sanitizeCredentialsId(workspaceId)(
              block.options?.credentialsId
            ),
          },
        }
      case IntegrationBlockType.GOOGLE_SHEETS:
        return {
          ...block,
          options: {
            ...block.options,
            credentialsId: await sanitizeCredentialsId(workspaceId)(
              block.options?.credentialsId
            ),
          },
        }
      case IntegrationBlockType.OPEN_AI:
        return {
          ...block,
          options: {
            ...block.options,
            credentialsId: await sanitizeCredentialsId(workspaceId)(
              block.options?.credentialsId
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
                block.options?.credentialsId
              )) ?? defaultSendEmailOptions.credentialsId,
          },
        }
      default:
        return block
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
