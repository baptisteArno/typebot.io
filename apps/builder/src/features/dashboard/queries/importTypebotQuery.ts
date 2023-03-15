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
  await Promise.all(
    webhookBlocks.map((s) =>
      duplicateWebhookQuery({
        existingIds: { typebotId: typebot.id, webhookId: s.webhookId },
        newIds: {
          typebotId: newTypebot.id,
          webhookId: webhookIdsMapping.get(s.webhookId) as string,
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
  const edgeIdsMapping = generateOldNewIdsMapping(typebot.edges)
  const webhookIdsMapping = generateOldNewIdsMapping(
    typebot.groups
      .flatMap((b) => b.blocks)
      .filter(isWebhookBlock)
      .map((s) => ({ id: s.webhookId }))
  )
  const id = createId()
  return {
    typebot: {
      ...typebot,
      version: '3',
      id,
      name: `${typebot.name} copy`,
      publicId: null,
      customDomain: null,
      groups: typebot.groups.map((b) => ({
        ...b,
        id: groupIdsMapping.get(b.id) as string,
        blocks: b.blocks.map((s) => {
          const newIds = {
            groupId: groupIdsMapping.get(s.groupId) as string,
            outgoingEdgeId: s.outgoingEdgeId
              ? edgeIdsMapping.get(s.outgoingEdgeId)
              : undefined,
          }
          if (
            s.type === LogicBlockType.TYPEBOT_LINK &&
            s.options.typebotId === 'current' &&
            isDefined(s.options.groupId)
          )
            return {
              ...s,
              options: {
                ...s.options,
                groupId: groupIdsMapping.get(s.options.groupId as string),
              },
            }
          if (s.type === LogicBlockType.JUMP)
            return {
              ...s,
              options: {
                ...s.options,
                groupId: groupIdsMapping.get(s.options.groupId as string),
              } satisfies JumpBlock['options'],
            }
          if (blockHasItems(s))
            return {
              ...s,
              items: s.items.map((item) => ({
                ...item,
                outgoingEdgeId: item.outgoingEdgeId
                  ? (edgeIdsMapping.get(item.outgoingEdgeId) as string)
                  : undefined,
              })),
              ...newIds,
            } as ChoiceInputBlock | ConditionBlock
          if (isWebhookBlock(s)) {
            return {
              ...s,
              webhookId: webhookIdsMapping.get(s.webhookId) as string,
              ...newIds,
            }
          }
          return {
            ...s,
            ...newIds,
          }
        }),
      })),
      edges: typebot.edges.map((e) => ({
        ...e,
        id: edgeIdsMapping.get(e.id) as string,
        from: {
          ...e.from,
          groupId: groupIdsMapping.get(e.from.groupId) as string,
        },
        to: { ...e.to, groupId: groupIdsMapping.get(e.to.groupId) as string },
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
