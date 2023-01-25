import { z } from 'zod'
import { BubbleBlockType } from './bubbles/enums'
import { BubbleBlock, bubbleBlockSchema } from './bubbles/schemas'
import { ChoiceInputBlock } from './inputs/choice'
import { InputBlockType } from './inputs/enums'
import {
  InputBlock,
  InputBlockOptions,
  inputBlockSchema,
} from './inputs/schemas'
import { IntegrationBlockType } from './integrations/enums'
import {
  IntegrationBlock,
  IntegrationBlockOptions,
  integrationBlockSchema,
} from './integrations/schemas'
import { ConditionBlock } from './logic/condition'
import { LogicBlockType } from './logic/enums'
import {
  LogicBlock,
  LogicBlockOptions,
  logicBlockSchema,
} from './logic/logicBlock'
import { blockBaseSchema } from './baseSchemas'
import { startBlockSchema } from './start/schemas'

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

export type BlockWithItems = ConditionBlock | ChoiceInputBlock

export type BlockBase = z.infer<typeof blockBaseSchema>

export type BlockIndices = {
  groupIndex: number
  blockIndex: number
}

export const blockSchema = startBlockSchema
  .or(bubbleBlockSchema)
  .or(inputBlockSchema)
  .or(logicBlockSchema)
  .or(integrationBlockSchema)

export type Block = z.infer<typeof blockSchema>
