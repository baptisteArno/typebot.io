import { ZodDiscriminatedUnionOption, z } from 'zod'
import { BubbleBlockType } from './bubbles/enums'
import { choiceInputSchema } from './inputs/choice'
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
} from './logic'
import { jumpBlockSchema } from './logic/jump'
import { pictureChoiceBlockSchema } from './inputs/pictureChoice'
import { Item } from '../items'

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

export type BlockWithOptions = Extract<Block, { options: any }>

export type BlockWithOptionsType =
  | InputBlockType
  | Exclude<LogicBlockType, LogicBlockType.CONDITION>
  | IntegrationBlockType

export type BlockOptions =
  | InputBlockOptions
  | LogicBlockOptions
  | IntegrationBlockOptions

export type BlockBase = z.infer<typeof blockBaseSchema>

export type BlockIndices = {
  groupIndex: number
  blockIndex: number
}

export const inputBlockSchemas = [
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
  pictureChoiceBlockSchema,
] as const

export const blockSchema = z.discriminatedUnion('type', [
  startBlockSchema,
  textBubbleBlockSchema,
  imageBubbleBlockSchema,
  videoBubbleBlockSchema,
  embedBubbleBlockSchema,
  audioBubbleBlockSchema,
  ...inputBlockSchemas,
  scriptBlockSchema,
  conditionBlockSchema,
  redirectBlockSchema,
  setVariableBlockSchema,
  typebotLinkBlockSchema,
  waitBlockSchema,
  jumpBlockSchema,
  abTestBlockSchema,
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

export type Block = z.infer<typeof blockSchema>

export type BubbleBlock = Extract<Block, { type: BubbleBlockType }>
export type BubbleBlockContent = BubbleBlock['content']

export type InputBlock = Extract<Block, { type: InputBlockType }>
export type InputBlockOptions = InputBlock['options']

export type LogicBlock = Extract<Block, { type: LogicBlockType }>
export type LogicBlockOptions = LogicBlock extends
  | {
      options?: infer Options
    }
  | {}
  ? Options
  : never

export type IntegrationBlock = Extract<Block, { type: IntegrationBlockType }>
export type IntegrationBlockOptions = IntegrationBlock['options']

export type BlockWithItems = Extract<Block, { items: Item[] }>
