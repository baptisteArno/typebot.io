import { z } from '../../zod'
import { blockBaseSchema } from './shared'
import { startBlockSchema } from './start/schemas'
import { ItemV6 } from '../items/schema'
import { bubbleBlockSchemas } from './bubbles/schema'
import { LogicBlock, logicBlockSchemas } from './logic/schema'
import { InputBlock, inputBlockSchemas } from './inputs/schema'
import { IntegrationBlock, integrationBlockSchemas } from './integrations'
import { forgedBlockSchemas } from '@typebot.io/forge-repository/schemas'

export type BlockWithOptions = Extract<Block, { options?: any }>

export type BlockWithOptionsType = BlockWithOptions['type']

export type BlockBase = z.infer<typeof blockBaseSchema>

export type BlockIndices = {
  groupIndex: number
  blockIndex: number
}

export const blockSchemaV5 = z.discriminatedUnion('type', [
  startBlockSchema,
  ...bubbleBlockSchemas,
  ...inputBlockSchemas.v5,
  ...logicBlockSchemas.v5,
  ...integrationBlockSchemas.v5,
])
export type BlockV5 = z.infer<typeof blockSchemaV5>

export const blockSchemaV6 = z
  .discriminatedUnion('type', [
    ...bubbleBlockSchemas,
    ...inputBlockSchemas.v6,
    ...logicBlockSchemas.v6,
    ...integrationBlockSchemas.v6,
    ...Object.values(forgedBlockSchemas),
  ])
  .openapi({
    title: 'Block',
    ref: 'block',
  })
export type BlockV6 = z.infer<typeof blockSchemaV6>

const blockSchema = blockSchemaV5.or(blockSchemaV6)
export type Block = z.infer<typeof blockSchema>

export type BlockOptions =
  | InputBlock['options']
  | LogicBlock['options']
  | IntegrationBlock['options']

export type BlockWithItems = Extract<BlockV6, { items: ItemV6[] }>
