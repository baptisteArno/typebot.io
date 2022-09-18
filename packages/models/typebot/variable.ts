import { z } from 'zod'

export const variableSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string().or(z.number()).optional(),
})

export type VariableWithValue = Omit<Variable, 'value'> & {
  value: string
}
export type Variable = z.infer<typeof variableSchema>
