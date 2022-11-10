import {
  Group,
  PublicTypebot,
  StartBlock,
  BubbleBlockType,
  InputBlockType,
  LogicBlockType,
  Block,
  DraggableBlockType,
  DraggableBlock,
  defaultTheme,
  defaultSettings,
  BlockOptions,
  BubbleBlockContent,
  IntegrationBlockType,
  defaultTextBubbleContent,
  defaultImageBubbleContent,
  defaultVideoBubbleContent,
  defaultTextInputOptions,
  defaultNumberInputOptions,
  defaultEmailInputOptions,
  defaultDateInputOptions,
  defaultPhoneInputOptions,
  defaultUrlInputOptions,
  defaultChoiceInputOptions,
  defaultSetVariablesOptions,
  defaultRedirectOptions,
  defaultGoogleSheetsOptions,
  defaultGoogleAnalyticsOptions,
  defaultCodeOptions,
  defaultWebhookOptions,
  BlockWithOptionsType,
  Item,
  ItemType,
  defaultConditionContent,
  defaultSendEmailOptions,
  defaultEmbedBubbleContent,
  ChoiceInputBlock,
  ConditionBlock,
  defaultPaymentInputOptions,
  defaultRatingInputOptions,
  defaultFileInputOptions,
} from 'models'
import { Typebot } from 'models'
import useSWR from 'swr'
import { fetcher, toKebabCase } from '../utils'
import {
  isBubbleBlockType,
  isWebhookBlock,
  omit,
  blockHasItems,
  blockTypeHasItems,
  blockTypeHasOption,
  blockTypeHasWebhook,
  env,
  isDefined,
} from 'utils'
import { dequal } from 'dequal'
import { stringify } from 'qs'
import { isChoiceInput, isConditionBlock, sendRequest } from 'utils'
import cuid from 'cuid'
import { diff } from 'deep-object-diff'
import { duplicateWebhook } from 'services/webhook'
import { Plan } from 'db'
import { defaultChatwootOptions } from 'models'

export type TypebotInDashboard = Pick<
  Typebot,
  'id' | 'name' | 'publishedTypebotId' | 'icon'
>
export const useTypebots = ({
  folderId,
  workspaceId,
  allFolders,
  onError,
}: {
  workspaceId?: string
  folderId?: string
  allFolders?: boolean
  onError: (error: Error) => void
}) => {
  const params = stringify({ folderId, allFolders, workspaceId })
  const { data, error, mutate } = useSWR<
    { typebots: TypebotInDashboard[] },
    Error
  >(workspaceId ? `/api/typebots?${params}` : null, fetcher, {
    dedupingInterval: env('E2E_TEST') === 'true' ? 0 : undefined,
  })
  if (error) onError(error)
  return {
    typebots: data?.typebots,
    isLoading: !error && !data,
    mutate,
  }
}

export const createTypebot = async ({
  folderId,
  workspaceId,
}: Pick<Typebot, 'folderId' | 'workspaceId'>) => {
  const typebot = {
    folderId,
    name: 'My typebot',
    workspaceId,
  }
  return sendRequest<Typebot>({
    url: `/api/typebots`,
    method: 'POST',
    body: typebot,
  })
}

export const importTypebot = async (typebot: Typebot, userPlan: Plan) => {
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
      duplicateWebhook(
        newTypebot.id,
        s.webhookId,
        webhookIdsMapping.get(s.webhookId) as string
      )
    )
  )
  return { data, error }
}

const duplicateTypebot = (
  typebot: Typebot,
  userPlan: Plan
): { typebot: Typebot; webhookIdsMapping: Map<string, string> } => {
  const groupIdsMapping = generateOldNewIdsMapping(typebot.groups)
  const edgeIdsMapping = generateOldNewIdsMapping(typebot.edges)
  const webhookIdsMapping = generateOldNewIdsMapping(
    typebot.groups
      .flatMap((b) => b.blocks)
      .filter(isWebhookBlock)
      .map((s) => ({ id: s.webhookId }))
  )
  const id = cuid()
  return {
    typebot: {
      ...typebot,
      id,
      name: `${typebot.name} copy`,
      publishedTypebotId: null,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resultsTablePreferences: typebot.resultsTablePreferences ?? undefined,
    },
    webhookIdsMapping,
  }
}

const generateOldNewIdsMapping = (itemWithId: { id: string }[]) => {
  const idsMapping: Map<string, string> = new Map()
  itemWithId.forEach((item) => idsMapping.set(item.id, cuid()))
  return idsMapping
}

export const getTypebot = (typebotId: string) =>
  sendRequest<{ typebot: Typebot }>({
    url: `/api/typebots/${typebotId}`,
    method: 'GET',
  })

export const deleteTypebot = async (id: string) =>
  sendRequest({
    url: `/api/typebots/${id}`,
    method: 'DELETE',
  })

export const updateTypebot = async (id: string, typebot: Typebot) =>
  sendRequest({
    url: `/api/typebots/${id}`,
    method: 'PUT',
    body: typebot,
  })

export const patchTypebot = async (id: string, typebot: Partial<Typebot>) =>
  sendRequest({
    url: `/api/typebots/${id}`,
    method: 'PATCH',
    body: typebot,
  })

export const parseNewBlock = (
  type: DraggableBlockType,
  groupId: string
): DraggableBlock => {
  const id = cuid()
  return {
    id,
    groupId,
    type,
    content: isBubbleBlockType(type) ? parseDefaultContent(type) : undefined,
    options: blockTypeHasOption(type)
      ? parseDefaultBlockOptions(type)
      : undefined,
    webhookId: blockTypeHasWebhook(type) ? cuid() : undefined,
    items: blockTypeHasItems(type) ? parseDefaultItems(type, id) : undefined,
  } as DraggableBlock
}

const parseDefaultItems = (
  type: LogicBlockType.CONDITION | InputBlockType.CHOICE,
  blockId: string
): Item[] => {
  switch (type) {
    case InputBlockType.CHOICE:
      return [{ id: cuid(), blockId, type: ItemType.BUTTON }]
    case LogicBlockType.CONDITION:
      return [
        {
          id: cuid(),
          blockId,
          type: ItemType.CONDITION,
          content: defaultConditionContent,
        },
      ]
  }
}

const parseDefaultContent = (type: BubbleBlockType): BubbleBlockContent => {
  switch (type) {
    case BubbleBlockType.TEXT:
      return defaultTextBubbleContent
    case BubbleBlockType.IMAGE:
      return defaultImageBubbleContent
    case BubbleBlockType.VIDEO:
      return defaultVideoBubbleContent
    case BubbleBlockType.EMBED:
      return defaultEmbedBubbleContent
  }
}

const parseDefaultBlockOptions = (type: BlockWithOptionsType): BlockOptions => {
  switch (type) {
    case InputBlockType.TEXT:
      return defaultTextInputOptions
    case InputBlockType.NUMBER:
      return defaultNumberInputOptions
    case InputBlockType.EMAIL:
      return defaultEmailInputOptions
    case InputBlockType.DATE:
      return defaultDateInputOptions
    case InputBlockType.PHONE:
      return defaultPhoneInputOptions
    case InputBlockType.URL:
      return defaultUrlInputOptions
    case InputBlockType.CHOICE:
      return defaultChoiceInputOptions
    case InputBlockType.PAYMENT:
      return defaultPaymentInputOptions
    case InputBlockType.RATING:
      return defaultRatingInputOptions
    case InputBlockType.FILE:
      return defaultFileInputOptions
    case LogicBlockType.SET_VARIABLE:
      return defaultSetVariablesOptions
    case LogicBlockType.REDIRECT:
      return defaultRedirectOptions
    case LogicBlockType.CODE:
      return defaultCodeOptions
    case LogicBlockType.TYPEBOT_LINK:
      return {}
    case IntegrationBlockType.GOOGLE_SHEETS:
      return defaultGoogleSheetsOptions
    case IntegrationBlockType.GOOGLE_ANALYTICS:
      return defaultGoogleAnalyticsOptions
    case IntegrationBlockType.ZAPIER:
    case IntegrationBlockType.PABBLY_CONNECT:
    case IntegrationBlockType.MAKE_COM:
    case IntegrationBlockType.WEBHOOK:
      return defaultWebhookOptions
    case IntegrationBlockType.EMAIL:
      return defaultSendEmailOptions
    case IntegrationBlockType.CHATWOOT:
      return defaultChatwootOptions
  }
}

export const checkIfTypebotsAreEqual = (typebotA: Typebot, typebotB: Typebot) =>
  dequal(
    JSON.parse(JSON.stringify(omit(typebotA, 'updatedAt'))),
    JSON.parse(JSON.stringify(omit(typebotB, 'updatedAt')))
  )

export const checkIfPublished = (
  typebot: Typebot,
  publicTypebot: PublicTypebot,
  debug?: boolean
) => {
  if (debug)
    console.log(
      diff(
        JSON.parse(JSON.stringify(typebot.groups)),
        JSON.parse(JSON.stringify(publicTypebot.groups))
      )
    )
  return (
    dequal(
      JSON.parse(JSON.stringify(typebot.groups)),
      JSON.parse(JSON.stringify(publicTypebot.groups))
    ) &&
    dequal(
      JSON.parse(JSON.stringify(typebot.settings)),
      JSON.parse(JSON.stringify(publicTypebot.settings))
    ) &&
    dequal(
      JSON.parse(JSON.stringify(typebot.theme)),
      JSON.parse(JSON.stringify(publicTypebot.theme))
    ) &&
    dequal(
      JSON.parse(JSON.stringify(typebot.variables)),
      JSON.parse(JSON.stringify(publicTypebot.variables))
    )
  )
}

export const parseDefaultPublicId = (name: string, id: string) =>
  toKebabCase(name) + `-${id?.slice(-7)}`

export const parseNewTypebot = ({
  folderId,
  name,
  ownerAvatarUrl,
  workspaceId,
  isBrandingEnabled = true,
}: {
  folderId: string | null
  workspaceId: string
  name: string
  ownerAvatarUrl?: string
  isBrandingEnabled?: boolean
}): Omit<
  Typebot,
  | 'createdAt'
  | 'updatedAt'
  | 'id'
  | 'publishedTypebotId'
  | 'publicId'
  | 'customDomain'
  | 'icon'
  | 'isArchived'
  | 'isClosed'
> => {
  const startGroupId = cuid()
  const startBlockId = cuid()
  const startBlock: StartBlock = {
    groupId: startGroupId,
    id: startBlockId,
    label: 'Start',
    type: 'start',
  }
  const startGroup: Group = {
    id: startGroupId,
    title: 'Start',
    graphCoordinates: { x: 0, y: 0 },
    blocks: [startBlock],
  }
  return {
    folderId,
    name,
    workspaceId,
    groups: [startGroup],
    edges: [],
    variables: [],
    theme: {
      ...defaultTheme,
      chat: {
        ...defaultTheme.chat,
        hostAvatar: { isEnabled: true, url: ownerAvatarUrl },
      },
    },
    settings: {
      ...defaultSettings,
      general: {
        ...defaultSettings.general,
        isBrandingEnabled,
      },
    },
  }
}

export const hasDefaultConnector = (block: Block) =>
  !isChoiceInput(block) && !isConditionBlock(block)
