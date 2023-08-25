import prisma from '@/lib/prisma'
import { Plan } from '@typebot.io/prisma'
import {
  Block,
  InputBlockType,
  IntegrationBlockType,
  Typebot,
} from '@typebot.io/schemas'

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
