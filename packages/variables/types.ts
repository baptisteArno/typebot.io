export type Variable = {
  id: string
  name: string
  value?: string | (string | null)[] | null | undefined
}

export type VariableWithValue = Pick<Variable, 'id' | 'name'> & {
  value: string | (string | null)[]
}

export type VariableWithUnknowValue = Pick<Variable, 'id' | 'name'> & {
  value?: unknown
}
