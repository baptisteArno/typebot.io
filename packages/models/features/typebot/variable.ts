import { z } from 'zod'

export const variableSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string().or(z.array(z.string())).nullish(),
})

/**
 * Variable when retrieved from the database
 */
export const variableWithValueSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string().or(z.array(z.string())),
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
