import { z } from 'zod'
import { BubbleBlockType } from './bubbles/enums'
import { ChoiceInputBlock, choiceInputSchema } from './inputs/choice'
import { InputBlockType } from './inputs/enums'
import { IntegrationBlockType } from './integrations/enums'
import { ConditionBlock, conditionBlockSchema } from './logic/condition'
import { LogicBlockType } from './logic/enums'
import { blockBaseSchema } from './baseSchemas'
import { startBlockSchema } from './start/schemas'
import {
  textBubbleBlockSchema,
  imageBubbleBlockSchema,
  videoBubbleBlockSchema,
  embedBubbleBlockSchema,
  audioBubbleBlockSchema,
} from './bubbles'
import {
  textInputSchema,
  emailInputSchema,
  numberInputSchema,
  urlInputSchema,
  phoneNumberInputBlockSchema,
  dateInputSchema,
  paymentInputSchema,
  ratingInputBlockSchema,
  fileInputStepSchema,
} from './inputs'
import {
  chatwootBlockSchema,
  googleAnalyticsBlockSchema,
  googleSheetsBlockSchema,
  makeComBlockSchema,
  pabblyConnectBlockSchema,
  sendEmailBlockSchema,
  webhookBlockSchema,
  zapierBlockSchema,
} from './integrations'
import { openAIBlockSchema } from './integrations/openai'
import {
  scriptBlockSchema,
  redirectBlockSchema,
  setVariableBlockSchema,
  typebotLinkBlockSchema,
  waitBlockSchema,
  abTestBlockSchema,
  AbTestBlock,
} from './logic'
import { jumpBlockSchema } from './logic/jump'

export type DraggableBlock =
  | BubbleBlock
  | InputBlock
  | LogicBlock
  | IntegrationBlock

export type BlockType =
  | 'start'
  | BubbleBlockType
  | InputBlockType
  | LogicBlockType
  | IntegrationBlockType

export type DraggableBlockType =
  | BubbleBlockType
  | InputBlockType
  | LogicBlockType
  | IntegrationBlockType

export type BlockWithOptions =
  | InputBlock
  | Exclude<LogicBlock, ConditionBlock>
  | IntegrationBlock

export type BlockWithOptionsType =
  | InputBlockType
  | Exclude<LogicBlockType, LogicBlockType.CONDITION>
  | IntegrationBlockType

export type BlockOptions =
  | InputBlockOptions
  | LogicBlockOptions
  | IntegrationBlockOptions

export type BlockWithItems = ConditionBlock | ChoiceInputBlock | AbTestBlock

export type BlockBase = z.infer<typeof blockBaseSchema>

export type BlockIndices = {
  groupIndex: number
  blockIndex: number
}

const bubbleBlockSchema = z.discriminatedUnion('type', [
  textBubbleBlockSchema,
  imageBubbleBlockSchema,
  videoBubbleBlockSchema,
  embedBubbleBlockSchema,
  audioBubbleBlockSchema,
])

export type BubbleBlock = z.infer<typeof bubbleBlockSchema>
export type BubbleBlockContent = BubbleBlock['content']

export const inputBlockSchema = z.discriminatedUnion('type', [
  textInputSchema,
  choiceInputSchema,
  emailInputSchema,
  numberInputSchema,
  urlInputSchema,
  phoneNumberInputBlockSchema,
  dateInputSchema,
  paymentInputSchema,
  ratingInputBlockSchema,
  fileInputStepSchema,
])

export type InputBlock = z.infer<typeof inputBlockSchema>
export type InputBlockOptions = InputBlock['options']

export const logicBlockSchema = z.discriminatedUnion('type', [
  scriptBlockSchema,
  conditionBlockSchema,
  redirectBlockSchema,
  setVariableBlockSchema,
  typebotLinkBlockSchema,
  waitBlockSchema,
  jumpBlockSchema,
  abTestBlockSchema,
])

export type LogicBlock = z.infer<typeof logicBlockSchema>

export type LogicBlockOptions = LogicBlock extends
  | {
      options?: infer Options
    }
  | {}
  ? Options
  : never

export const integrationBlockSchema = z.discriminatedUnion('type', [
  chatwootBlockSchema,
  googleAnalyticsBlockSchema,
  googleSheetsBlockSchema,
  makeComBlockSchema,
  openAIBlockSchema,
  pabblyConnectBlockSchema,
  sendEmailBlockSchema,
  webhookBlockSchema,
  zapierBlockSchema,
])

export type IntegrationBlock = z.infer<typeof integrationBlockSchema>
export type IntegrationBlockOptions = IntegrationBlock['options']

export const blockSchema = z.union([
  startBlockSchema,
  bubbleBlockSchema,
  inputBlockSchema,
  logicBlockSchema,
  integrationBlockSchema,
])

export type Block = z.infer<typeof blockSchema>
