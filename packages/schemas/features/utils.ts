import { z } from '../zod'

export type IdMap<T> = { [id: string]: T }

export const variableStringSchema = z.custom<`{{${string}}}`>((val) =>
  /^{{.+}}$/g.test(val as string)
)

export type VariableString = z.infer<typeof variableStringSchema>
