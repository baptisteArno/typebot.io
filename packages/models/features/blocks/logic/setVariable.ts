import { z } from 'zod'
import { blockBaseSchema } from '../baseSchemas'
import { LogicBlockType } from './enums'

export const setVariableOptionsSchema = z.object({
  variableId: z.string().optional(),
  expressionToEvaluate: z.string().optional(),
  isCode: z.boolean().optional(),
})

export const setVariableBlockSchema = blockBaseSchema.and(
  z.object({
    type: z.enum([LogicBlockType.SET_VARIABLE]),
    options: setVariableOptionsSchema,
  })
)

export const defaultSetVariablesOptions: SetVariableOptions = {}

export type SetVariableBlock = z.infer<typeof setVariableBlockSchema>
export type SetVariableOptions = z.infer<typeof setVariableOptionsSchema>
