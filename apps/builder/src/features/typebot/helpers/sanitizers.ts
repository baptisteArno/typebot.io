import { forgedBlockSchemas } from '@typebot.io/forge-schemas'
import { enabledBlocks } from '@typebot.io/forge-repository'
import prisma from '@typebot.io/lib/prisma'
import { Plan } from '@typebot.io/prisma'
import { Block, Typebot } from '@typebot.io/schemas'
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

    if (enabledBlocks.includes(block.type as (typeof enabledBlocks)[number])) {
      const schema = forgedBlockSchemas.find(
        (s) => s.shape.type.value === block.type
      )
      if (!schema)
        throw new Error(
          `Integration block schema not found for block type ${block.type}`
        )
      return schema.parse({
        ...block,
        options: {
          ...block.options,
          credentialsId: await sanitizeCredentialsId(workspaceId)(
            block.options.credentialsId
          ),
        },
      })
    }

    if (!('credentialsId' in block.options) || !block.options.credentialsId)
      return block

    switch (block.type) {
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
        return {
          ...block,
          options: {
            ...block.options,
            credentialsId: await sanitizeCredentialsId(workspaceId)(
              block.options?.credentialsId
            ),
          },
        }
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
