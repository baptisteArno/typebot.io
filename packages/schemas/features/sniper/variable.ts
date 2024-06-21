import { z } from '../../zod'

export const listVariableValue = z.array(z.string().nullable())

const baseVariableSchema = z.object({
  id: z.string(),
  name: z.string(),
  isSessionVariable: z.boolean().optional(),
})

export const variableSchema = baseVariableSchema.extend({
  value: z.string().or(listVariableValue).nullish(),
})

/**
 * Variable when retrieved from the database
 */
export const variableWithValueSchema = baseVariableSchema.extend({
  value: z.string().or(listVariableValue),
})

/**
 * Variable when computed or retrieved from a block
 */
const VariableWithUnknowValueSchema = baseVariableSchema.extend({
  value: z.unknown(),
})

export type Variable = z.infer<typeof variableSchema>
export type VariableWithValue = z.infer<typeof variableWithValueSchema>
export type VariableWithUnknowValue = z.infer<
  typeof VariableWithUnknowValueSchema
>
