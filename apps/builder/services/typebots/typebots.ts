import {
  Block,
  PublicTypebot,
  StartStep,
  BubbleStepType,
  InputStepType,
  LogicStepType,
  Step,
  DraggableStepType,
  DraggableStep,
  defaultTheme,
  defaultSettings,
  StepOptions,
  BubbleStepContent,
  IntegrationStepType,
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
  StepWithOptionsType,
  Item,
  ItemType,
  defaultConditionContent,
  defaultSendEmailOptions,
  defaultEmbedBubbleContent,
  ChoiceInputStep,
  ConditionStep,
  OctaStepOptions,
  OctaStepType,
  defaultAssignToTeamOptions,
  defaultEndConversationBubbleContent,
  OctaBubbleStepType,
  OctaBubbleStepContent
} from 'models'
import { Typebot } from 'models'
import useSWR from 'swr'
import { fetcher, toKebabCase } from '../utils'
import {
  isBubbleStepType,
  isOctaBubbleStepType,
  isOctaStepType,
  isWebhookStep,
  stepHasItems,
  stepTypeHasItems,
  stepTypeHasOption,
  stepTypeHasWebhook,
} from 'utils'
import { dequal } from 'dequal'
import { stringify } from 'qs'
import { isChoiceInput, isConditionStep, sendRequest } from 'utils'
import cuid from 'cuid'
import { diff } from 'deep-object-diff'
import { duplicateWebhook } from 'services/webhook'
import { Plan } from 'db'
import { isDefined } from '@chakra-ui/utils'

export type TypebotInDashboard = Pick<
  Typebot,
  'id' | 'name' | 'publishedTypebotId' | 'icon'
>
export const useTypebots = ({
  folderId,
  allFolders,
  onError,
}: {
  folderId?: string
  allFolders?: boolean
  onError: (error: Error) => void
}) => {
  const params = stringify({ folderId, allFolders })
  const { data, error, mutate } = useSWR<
    { typebots: TypebotInDashboard[] },
    Error
  >(`/api/typebots?${params}`, fetcher, {
    dedupingInterval: process.env.NEXT_PUBLIC_E2E_TEST ? 0 : undefined,
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
}: Pick<Typebot, 'folderId'>) => {
  const typebot = {
    folderId,
    name: 'My typebot',
  }
  return sendRequest<Typebot>({
    url: `/api/typebots`,
    method: 'POST',
    body: typebot,
  })
}

export const importTypebot = async (typebot: Typebot, userPlan: Plan) => {
  return sendRequest<Typebot>({
    url: `/api/typebots`,
    method: 'POST',
    body: await duplicateTypebot(typebot, userPlan),
  })
}

const duplicateTypebot = async (
  typebot: Typebot,
  userPlan: Plan
): Promise<Typebot> => {
  const blockIdsMapping = generateOldNewIdsMapping(typebot.blocks)
  const edgeIdsMapping = generateOldNewIdsMapping(typebot.edges)
  return {
    ...typebot,
    id: cuid(),
    name: `${typebot.name} copy`,
    publishedTypebotId: null,
    publicId: null,
    customDomain: null,
    blocks: await Promise.all(
      typebot.blocks.map(async (b) => ({
        ...b,
        id: blockIdsMapping.get(b.id) as string,
        steps: await Promise.all(
          b.steps.map(async (s) => {
            const newIds = {
              blockId: blockIdsMapping.get(s.blockId) as string,
              outgoingEdgeId: s.outgoingEdgeId
                ? edgeIdsMapping.get(s.outgoingEdgeId)
                : undefined,
            }
            if (
              s.type === LogicStepType.TYPEBOT_LINK &&
              s.options.typebotId === 'current' &&
              isDefined(s.options.blockId)
            )
              return {
                ...s,
                options: {
                  ...s.options,
                  blockId: blockIdsMapping.get(s.options.blockId as string),
                },
              }
            if (stepHasItems(s))
              return {
                ...s,
                items: s.items.map((item) => ({
                  ...item,
                  outgoingEdgeId: item.outgoingEdgeId
                    ? (edgeIdsMapping.get(item.outgoingEdgeId) as string)
                    : undefined,
                })),
                ...newIds,
              } as ChoiceInputStep | ConditionStep
            if (isWebhookStep(s)) {
              const newWebhook = await duplicateWebhook(s.webhookId)
              return {
                ...s,
                webhookId: newWebhook ? newWebhook.id : cuid(),
                ...newIds,
              }
            }
            return {
              ...s,
              ...newIds,
            }
          })
        ),
      }))
    ),
    edges: typebot.edges.map((e) => ({
      ...e,
      id: edgeIdsMapping.get(e.id) as string,
      from: {
        ...e.from,
        blockId: blockIdsMapping.get(e.from.blockId) as string,
      },
      to: { ...e.to, blockId: blockIdsMapping.get(e.to.blockId) as string },
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

export const parseNewStep = (
  type: DraggableStepType,
  blockId: string
): DraggableStep => {
  const id = cuid()
  return {
    id,
    blockId,
    type,
    content: isBubbleStepType(type) || isOctaBubbleStepType(type)
      ? parseDefaultContent(type)
      : undefined,
    options: isOctaStepType(type)
      ? parseOctaStepOptions(type)
      : stepTypeHasOption(type)
      ? parseDefaultStepOptions(type)
      : undefined,
    webhookId: stepTypeHasWebhook(type) ? cuid() : undefined,
    items: stepTypeHasItems(type) ? parseDefaultItems(type, id) : undefined,
  } as DraggableStep
}

const parseDefaultItems = (
  type: LogicStepType.CONDITION | InputStepType.CHOICE,
  stepId: string
): Item[] => {
  switch (type) {
    case InputStepType.CHOICE:
      return [{ id: cuid(), stepId, type: ItemType.BUTTON }]
    case LogicStepType.CONDITION:
      return [
        {
          id: cuid(),
          stepId,
          type: ItemType.CONDITION,
          content: defaultConditionContent,
        },
      ]
  }
}

const parseDefaultContent = (type: BubbleStepType | OctaBubbleStepType): BubbleStepContent => {
  switch (type) {
    case BubbleStepType.TEXT:
      return defaultTextBubbleContent
    case BubbleStepType.IMAGE:
      return defaultImageBubbleContent
    case BubbleStepType.VIDEO:
      return defaultVideoBubbleContent
    case BubbleStepType.EMBED:
      return defaultEmbedBubbleContent
    case OctaBubbleStepType.END_CONVERSATION:
      return defaultEndConversationBubbleContent
  }
}

const parseOctaStepOptions = (type: OctaStepType): OctaStepOptions => {
  switch (type) {
    case OctaStepType.ASSIGN_TO_TEAM:
      return defaultAssignToTeamOptions
  }
}

const parseDefaultStepOptions = (type: StepWithOptionsType): StepOptions => {
  switch (type) {
    case InputStepType.TEXT:
      return defaultTextInputOptions
    case InputStepType.NUMBER:
      return defaultNumberInputOptions
    case InputStepType.EMAIL:
      return defaultEmailInputOptions
    case InputStepType.DATE:
      return defaultDateInputOptions
    case InputStepType.PHONE:
      return defaultPhoneInputOptions
    case InputStepType.URL:
      return defaultUrlInputOptions
    case InputStepType.CHOICE:
      return defaultChoiceInputOptions
    case LogicStepType.SET_VARIABLE:
      return defaultSetVariablesOptions
    case LogicStepType.REDIRECT:
      return defaultRedirectOptions
    case LogicStepType.CODE:
      return defaultCodeOptions
    case LogicStepType.TYPEBOT_LINK:
      return {}
    case IntegrationStepType.GOOGLE_SHEETS:
      return defaultGoogleSheetsOptions
    case IntegrationStepType.GOOGLE_ANALYTICS:
      return defaultGoogleAnalyticsOptions
    case IntegrationStepType.ZAPIER:
    case IntegrationStepType.PABBLY_CONNECT:
    case IntegrationStepType.MAKE_COM:
    case IntegrationStepType.WEBHOOK:
      return defaultWebhookOptions
    case IntegrationStepType.EMAIL:
      return defaultSendEmailOptions
  }
}

export const checkIfTypebotsAreEqual = (typebotA: Typebot, typebotB: Typebot) =>
  dequal(
    JSON.parse(JSON.stringify(typebotA)),
    JSON.parse(JSON.stringify(typebotB))
  )

export const checkIfPublished = (
  typebot: Typebot,
  publicTypebot: PublicTypebot,
  debug?: boolean
) => {
  if (debug)
    console.log(
      diff(
        JSON.parse(JSON.stringify(typebot.blocks)),
        JSON.parse(JSON.stringify(publicTypebot.blocks))
      )
    )
  return (
    dequal(
      JSON.parse(JSON.stringify(typebot.blocks)),
      JSON.parse(JSON.stringify(publicTypebot.blocks))
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
  ownerId,
  folderId,
  name,
  ownerAvatarUrl,
}: {
  ownerId: string
  folderId: string | null
  name: string
  ownerAvatarUrl?: string
}): Omit<
  Typebot,
  | 'createdAt'
  | 'updatedAt'
  | 'id'
  | 'publishedTypebotId'
  | 'publicId'
  | 'customDomain'
  | 'icon'
> => {
  const startBlockId = cuid()
  const startStepId = cuid()
  const startStep: StartStep = {
    blockId: startBlockId,
    id: startStepId,
    label: 'Start',
    type: 'start',
  }
  const startBlock: Block = {
    id: startBlockId,
    title: 'Start',
    graphCoordinates: { x: 0, y: 0 },
    steps: [startStep],
  }
  return {
    folderId,
    subDomain: '',
    name,
    ownerId,
    blocks: [startBlock],
    edges: [],
    variables: [],
    theme: {
      ...defaultTheme,
      chat: {
        ...defaultTheme.chat,
        hostAvatar: { isEnabled: true, url: ownerAvatarUrl },
      },
    },
    settings: defaultSettings,
  }
}

export const hasDefaultConnector = (step: Step) =>
  !isChoiceInput(step) && !isConditionStep(step)
