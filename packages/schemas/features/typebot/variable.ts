import { z } from 'zod'

export const listVariableValue = z.array(z.string().nullable())

export const variableSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string().or(listVariableValue).nullish(),
})

/**
 * Variable when retrieved from the database
 */
export const variableWithValueSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string().or(listVariableValue),
})

/**
 * Variable when computed or retrieved from a block
 */
const VariableWithUnknowValueSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.unknown(),
})

export type Variable = z.infer<typeof variableSchema>
export type VariableWithValue = z.infer<typeof variableWithValueSchema>
export type VariableWithUnknowValue = z.infer<
  typeof VariableWithUnknowValueSchema
>
