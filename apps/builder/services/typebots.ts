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
  defaultWebhookOptions,
  StepWithOptionsType,
  defaultWebhookAttributes,
  Webhook,
  Item,
  ItemType,
  defaultConditionContent,
} from 'models'
import shortId, { generate } from 'short-uuid'
import { Typebot } from 'models'
import useSWR from 'swr'
import { fetcher, toKebabCase } from './utils'
import {
  isBubbleStepType,
  stepTypeHasItems,
  stepTypeHasOption,
  stepTypeHasWebhook,
} from 'utils'
import { deepEqual } from 'fast-equals'
import { stringify } from 'qs'
import { isChoiceInput, isConditionStep, sendRequest } from 'utils'

export const useTypebots = ({
  folderId,
  onError,
}: {
  folderId?: string
  onError: (error: Error) => void
}) => {
  const params = stringify({ folderId })
  const { data, error, mutate } = useSWR<{ typebots: Typebot[] }, Error>(
    `/api/typebots?${params}`,
    fetcher,
    { dedupingInterval: 0 }
  )
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

export const importTypebot = async (typebot: Typebot) =>
  sendRequest<Typebot>({
    url: `/api/typebots`,
    method: 'POST',
    body: typebot,
  })

export const duplicateTypebot = async ({
  folderId,
  ownerId,
  name,
}: Typebot) => {
  const typebot = {
    folderId,
    ownerId,
    name: `${name} copy`,
  }
  return sendRequest<Typebot>({
    url: `/api/typebots`,
    method: 'POST',
    body: typebot,
  })
}

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
  const id = `s${shortId.generate()}`
  return {
    id,
    blockId,
    type,
    content: isBubbleStepType(type) ? parseDefaultContent(type) : undefined,
    options: stepTypeHasOption(type)
      ? parseDefaultStepOptions(type)
      : undefined,
    webhook: stepTypeHasWebhook(type) ? parseDefaultWebhook() : undefined,
    items: stepTypeHasItems(type) ? parseDefaultItems(type, id) : undefined,
  } as DraggableStep
}

const parseDefaultWebhook = (): Webhook => ({
  id: generate(),
  ...defaultWebhookAttributes,
})

const parseDefaultItems = (
  type: LogicStepType.CONDITION | InputStepType.CHOICE,
  stepId: string
): Item[] => {
  switch (type) {
    case InputStepType.CHOICE:
      return [{ id: generate(), stepId, type: ItemType.BUTTON }]
    case LogicStepType.CONDITION:
      return [
        {
          id: generate(),
          stepId,
          type: ItemType.CONDITION,
          content: defaultConditionContent,
        },
      ]
  }
}

const parseDefaultContent = (type: BubbleStepType): BubbleStepContent => {
  switch (type) {
    case BubbleStepType.TEXT:
      return defaultTextBubbleContent
    case BubbleStepType.IMAGE:
      return defaultImageBubbleContent
    case BubbleStepType.VIDEO:
      return defaultVideoBubbleContent
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
    case IntegrationStepType.GOOGLE_SHEETS:
      return defaultGoogleSheetsOptions
    case IntegrationStepType.GOOGLE_ANALYTICS:
      return defaultGoogleAnalyticsOptions
    case IntegrationStepType.WEBHOOK:
      return defaultWebhookOptions
  }
}

export const checkIfTypebotsAreEqual = (typebotA: Typebot, typebotB: Typebot) =>
  deepEqual(
    JSON.parse(JSON.stringify(typebotA)),
    JSON.parse(JSON.stringify(typebotB))
  )

export const checkIfPublished = (
  typebot: Typebot,
  publicTypebot: PublicTypebot
) =>
  deepEqual(typebot.blocks, publicTypebot.blocks) &&
  typebot.name === publicTypebot.name &&
  typebot.publicId === publicTypebot.publicId &&
  deepEqual(typebot.settings, publicTypebot.settings) &&
  deepEqual(typebot.theme, publicTypebot.theme)

export const parseDefaultPublicId = (name: string, id: string) =>
  toKebabCase(name) + `-${id?.slice(-7)}`

export const parseNewTypebot = ({
  ownerId,
  folderId,
  name,
}: {
  ownerId: string
  folderId: string | null
  name: string
}): Omit<
  Typebot,
  'createdAt' | 'updatedAt' | 'id' | 'publishedTypebotId' | 'publicId'
> => {
  const startBlockId = shortId.generate()
  const startStepId = shortId.generate()
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
    name,
    ownerId,
    blocks: [startBlock],
    edges: [],
    variables: [],
    theme: defaultTheme,
    settings: defaultSettings,
  }
}

export const hasDefaultConnector = (step: Step) =>
  !isChoiceInput(step) && !isConditionStep(step)
