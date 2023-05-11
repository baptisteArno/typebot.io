import { z } from 'zod'
import { blockBaseSchema } from '../baseSchemas'
import { LogicBlockType } from './enums'

export const valueTypes = [
  'Custom',
  'Empty',
  'User ID',
  'Today',
  'Yesterday',
  'Tomorrow',
  'Random ID',
  'Map item with same index',
] as const

export const setVariableOptionsSchema = z.object({
  variableId: z.string().optional(),
  expressionToEvaluate: z.string().optional(),
  isCode: z.boolean().optional(),
  type: z.enum(valueTypes).optional(),
  mapListItemParams: z
    .object({
      baseItemVariableId: z.string().optional(),
      baseListVariableId: z.string().optional(),
      targetListVariableId: z.string().optional(),
    })
    .optional(),
  isExecutedOnClient: z.boolean().optional(),
})

export const setVariableBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.SET_VARIABLE]),
    options: setVariableOptionsSchema,
  })
)

export const defaultSetVariablesOptions: SetVariableOptions = {}

export type SetVariableBlock = z.infer<typeof setVariableBlockSchema>
export type SetVariableOptions = z.infer<typeof setVariableOptionsSchema>
