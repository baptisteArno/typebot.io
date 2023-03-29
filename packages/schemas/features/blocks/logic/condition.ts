import { z } from 'zod'
import { ItemType } from '../../items/enums'
import { itemBaseSchema } from '../../items/baseSchemas'
import { blockBaseSchema } from '../baseSchemas'
import { LogicBlockType } from './enums'

export enum LogicalOperator {
  OR = 'OR',
  AND = 'AND',
}

export enum ComparisonOperators {
  EQUAL = 'Equal to',
  NOT_EQUAL = 'Not equal',
  CONTAINS = 'Contains',
  NOT_CONTAINS = 'Does not contain',
  GREATER = 'Greater than',
  LESS = 'Less than',
  IS_SET = 'Is set',
  IS_EMPTY = 'Is empty',
  STARTS_WITH = 'Starts with',
  ENDS_WITH = 'Ends with',
}

const comparisonSchema = z.object({
  id: z.string(),
  variableId: z.string().optional(),
  comparisonOperator: z.nativeEnum(ComparisonOperators).optional(),
  value: z.string().optional(),
})

const conditionContentSchema = z.object({
  logicalOperator: z.nativeEnum(LogicalOperator),
  comparisons: z.array(comparisonSchema),
})

export const conditionItemSchema = itemBaseSchema.merge(
  z.object({
    type: z.literal(ItemType.CONDITION),
    content: conditionContentSchema,
  })
)

export const conditionBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.CONDITION]),
    items: z.array(conditionItemSchema),
  })
)

export const defaultConditionContent: ConditionContent = {
  comparisons: [],
  logicalOperator: LogicalOperator.AND,
}

export type ConditionItem = z.infer<typeof conditionItemSchema>
export type Comparison = z.infer<typeof comparisonSchema>
export type ConditionBlock = z.infer<typeof conditionBlockSchema>
export type ConditionContent = z.infer<typeof conditionContentSchema>
