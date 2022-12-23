import { z } from 'zod'
import {
  itemBaseSchema,
  ItemType,
  LogicBlockType,
  blockBaseSchema,
} from '../shared'

export enum LogicalOperator {
  OR = 'OR',
  AND = 'AND',
}

export enum ComparisonOperators {
  EQUAL = 'Equal to',
  NOT_EQUAL = 'Not equal',
  CONTAINS = 'Contains',
  GREATER = 'Greater than',
  LESS = 'Less than',
  IS_SET = 'Is set',
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

export const conditionItemSchema = itemBaseSchema.and(
  z.object({
    type: z.literal(ItemType.CONDITION),
    content: conditionContentSchema,
  })
)

export const conditionBlockSchema = blockBaseSchema.and(
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
