import { z } from 'zod'
import { LogicStepType, stepBaseSchema } from '../shared'

export const setVariableOptionsSchema = z.object({
  variableId: z.string().optional(),
  expressionToEvaluate: z.string().optional(),
  isCode: z.boolean().optional(),
})

export const setVariableStepSchema = stepBaseSchema.and(
  z.object({
    type: z.enum([LogicStepType.SET_VARIABLE]),
    options: setVariableOptionsSchema,
  })
)

export const defaultSetVariablesOptions: SetVariableOptions = {}

export type SetVariableStep = z.infer<typeof setVariableStepSchema>
export type SetVariableOptions = z.infer<typeof setVariableOptionsSchema>
