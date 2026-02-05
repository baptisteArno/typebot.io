import { z } from '../../../../zod'
import { blockBaseSchema } from '../../shared'
import { LogicBlockType } from '../constants'

export const declaredVariableSchema = z.object({
  variableId: z.string(),
  description: z.string(), // Required in UI, but allow empty during editing
  required: z.boolean().optional().default(true).openapi({ effectType: 'input' }),
})

export const declareVariablesOptionsSchema = z.object({
  variables: z
    .array(declaredVariableSchema)
    .default([])
    .openapi({ effectType: 'input' }),
})

export const declareVariablesBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.DECLARE_VARIABLES]),
    options: declareVariablesOptionsSchema.optional(),
  })
)

export type DeclareVariablesBlock = z.infer<typeof declareVariablesBlockSchema>
export type DeclaredVariable = z.infer<typeof declaredVariableSchema>
