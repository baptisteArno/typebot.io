import { createId } from '@paralleldrive/cuid2'
import { Plan, Prisma } from '@typebot.io/prisma'
import {
  ChoiceInputBlock,
  ConditionBlock,
  LogicBlockType,
  Typebot,
} from '@typebot.io/schemas'
import { JumpBlock } from '@typebot.io/schemas/features/blocks/logic/jump'
import {
  blockHasItems,
  isDefined,
  isWebhookBlock,
  sendRequest,
} from '@typebot.io/lib'
import { duplicateWebhookQuery } from '@/features/blocks/integrations/webhook/queries/duplicateWebhookQuery'

export const importTypebotQuery = async (typebot: Typebot, userPlan: Plan) => {
  const { typebot: newTypebot, webhookIdsMapping } = duplicateTypebot(
    typebot,
    userPlan
  )
  const { data, error } = await sendRequest<Typebot>({
    url: `/api/typebots`,
    method: 'POST',
    body: newTypebot,
  })
  if (!data) return { data, error }
  const webhookBlocks = typebot.groups
    .flatMap((b) => b.blocks)
    .filter(isWebhookBlock)
    .filter((block) => block.webhookId)
  await Promise.all(
    webhookBlocks.map((webhookBlock) =>
      duplicateWebhookQuery({
        existingIds: {
          typebotId: typebot.id,
          webhookId: webhookBlock.webhookId as string,
        },
        newIds: {
          typebotId: newTypebot.id,
          webhookId: webhookIdsMapping.get(
            webhookBlock.webhookId as string
          ) as string,
        },
      })
    )
  )
  return { data, error }
}

const duplicateTypebot = (
  typebot: Typebot,
  userPlan: Plan
): {
  typebot: Omit<Prisma.TypebotUncheckedCreateInput, 'id'> & { id: string }
  webhookIdsMapping: Map<string, string>
} => {
  const groupIdsMapping = generateOldNewIdsMapping(typebot.groups)
  const blockIdsMapping = generateOldNewIdsMapping(
    typebot.groups.flatMap((group) => group.blocks)
  )
  const edgeIdsMapping = generateOldNewIdsMapping(typebot.edges)
  const webhookIdsMapping = generateOldNewIdsMapping(
    typebot.groups
      .flatMap((group) => group.blocks)
      .filter(isWebhookBlock)
      .map((block) => ({
        id: block.webhookId as string,
      }))
  )
  const id = createId()
  return {
    typebot: {
      ...typebot,
      id,
      name: `${typebot.name} copy`,
      publicId: null,
      customDomain: null,
      groups: typebot.groups.map((group) => ({
        ...group,
        id: groupIdsMapping.get(group.id) as string,
        blocks: group.blocks.map((block) => {
          const newIds = {
            id: blockIdsMapping.get(block.id) as string,
            groupId: groupIdsMapping.get(block.groupId) as string,
            outgoingEdgeId: block.outgoingEdgeId
              ? edgeIdsMapping.get(block.outgoingEdgeId)
              : undefined,
          }
          if (
            block.type === LogicBlockType.TYPEBOT_LINK &&
            block.options.typebotId === 'current' &&
            isDefined(block.options.groupId)
          )
            return {
              ...block,
              ...newIds,
              options: {
                ...block.options,
                groupId: groupIdsMapping.get(block.options.groupId as string),
              },
            }
          if (block.type === LogicBlockType.JUMP)
            return {
              ...block,
              ...newIds,
              options: {
                ...block.options,
                groupId: groupIdsMapping.get(block.options.groupId as string),
                blockId: blockIdsMapping.get(block.options.blockId as string),
              } satisfies JumpBlock['options'],
            }
          if (blockHasItems(block))
            return {
              ...block,
              ...newIds,
              items: block.items.map((item) => ({
                ...item,
                blockId: blockIdsMapping.get(item.blockId) as string,
                outgoingEdgeId: item.outgoingEdgeId
                  ? (edgeIdsMapping.get(item.outgoingEdgeId) as string)
                  : undefined,
              })),
            } as ChoiceInputBlock | ConditionBlock
          if (isWebhookBlock(block) && block.webhookId) {
            return {
              ...block,
              ...newIds,
              webhookId: webhookIdsMapping.get(block.webhookId) as string,
            }
          }
          return {
            ...block,
            ...newIds,
          }
        }),
      })),
      edges: typebot.edges.map((edge) => ({
        ...edge,
        id: edgeIdsMapping.get(edge.id) as string,
        from: {
          ...edge.from,
          blockId: blockIdsMapping.get(edge.from.blockId) as string,
          groupId: groupIdsMapping.get(edge.from.groupId) as string,
        },
        to: {
          ...edge.to,
          blockId: edge.to.blockId
            ? (blockIdsMapping.get(edge.to.blockId) as string)
            : undefined,
          groupId: groupIdsMapping.get(edge.to.groupId) as string,
        },
      })),
      settings:
        typebot.settings.general.isBrandingEnabled === false &&
        userPlan === Plan.FREE
          ? {
              ...typebot.settings,
              general: { ...typebot.settings.general, isBrandingEnabled: true },
            }
          : typebot.settings,
      createdAt: new Date(),
      updatedAt: new Date(),
      resultsTablePreferences: typebot.resultsTablePreferences ?? undefined,
    },
    webhookIdsMapping,
  }
}

const generateOldNewIdsMapping = (itemWithId: { id: string }[]) => {
  const idsMapping: Map<string, string> = new Map()
  itemWithId.forEach((item) => idsMapping.set(item.id, createId()))
  return idsMapping
}
