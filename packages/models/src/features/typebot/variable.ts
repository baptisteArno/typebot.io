import { z } from 'zod'

export const variableSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string().optional().nullable(),
})

/**
 * Variable when retrieved from the database
 */
export type VariableWithValue = Omit<Variable, 'value'> & {
  value: string
}

/**
 * Variable when computed or retrieved from a block
 */
export type VariableWithUnknowValue = Omit<VariableWithValue, 'value'> & {
  value: unknown
}

export type Variable = z.infer<typeof variableSchema>
