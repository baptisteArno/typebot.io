import { createId } from '@paralleldrive/cuid2'
import {
  isBubbleBlockType,
  blockTypeHasOption,
  blockTypeHasWebhook,
  blockTypeHasItems,
} from '@typebot.io/lib'
import {
  DraggableBlockType,
  DraggableBlock,
  BlockOptions,
  BlockWithOptionsType,
  BubbleBlockContent,
  BubbleBlockType,
  defaultAudioBubbleContent,
  defaultChatwootOptions,
  defaultChoiceInputOptions,
  defaultConditionContent,
  defaultDateInputOptions,
  defaultEmailInputOptions,
  defaultEmbedBubbleContent,
  defaultFileInputOptions,
  defaultGoogleAnalyticsOptions,
  defaultGoogleSheetsOptions,
  defaultImageBubbleContent,
  defaultNumberInputOptions,
  defaultPaymentInputOptions,
  defaultPhoneInputOptions,
  defaultRatingInputOptions,
  defaultRedirectOptions,
  defaultScriptOptions,
  defaultSendEmailOptions,
  defaultSetVariablesOptions,
  defaultTextBubbleContent,
  defaultTextInputOptions,
  defaultUrlInputOptions,
  defaultVideoBubbleContent,
  defaultWaitOptions,
  defaultWebhookOptions,
  InputBlockType,
  IntegrationBlockType,
  Item,
  ItemType,
  LogicBlockType,
  defaultAbTestOptions,
} from '@typebot.io/schemas'

const parseDefaultItems = (
  type:
    | LogicBlockType.CONDITION
    | InputBlockType.CHOICE
    | LogicBlockType.AB_TEST,
  blockId: string
): Item[] => {
  switch (type) {
    case InputBlockType.CHOICE:
      return [{ id: createId(), blockId, type: ItemType.BUTTON }]
    case LogicBlockType.CONDITION:
      return [
        {
          id: createId(),
          blockId,
          type: ItemType.CONDITION,
          content: defaultConditionContent,
        },
      ]
    case LogicBlockType.AB_TEST:
      return [
        { id: createId(), blockId, type: ItemType.AB_TEST, path: 'a' },
        { id: createId(), blockId, type: ItemType.AB_TEST, path: 'b' },
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
    case BubbleBlockType.AUDIO:
      return defaultAudioBubbleContent
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
    case LogicBlockType.SCRIPT:
      return defaultScriptOptions
    case LogicBlockType.WAIT:
      return defaultWaitOptions
    case LogicBlockType.JUMP:
      return {}
    case LogicBlockType.TYPEBOT_LINK:
      return {}
    case LogicBlockType.AB_TEST:
      return defaultAbTestOptions
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
    case IntegrationBlockType.OPEN_AI:
      return {}
  }
}

export const parseNewBlock = (
  type: DraggableBlockType,
  groupId: string
): DraggableBlock => {
  const id = createId()
  return {
    id,
    groupId,
    type,
    content: isBubbleBlockType(type) ? parseDefaultContent(type) : undefined,
    options: blockTypeHasOption(type)
      ? parseDefaultBlockOptions(type)
      : undefined,
    webhookId: blockTypeHasWebhook(type) ? createId() : undefined,
    items: blockTypeHasItems(type) ? parseDefaultItems(type, id) : undefined,
  } as DraggableBlock
}
