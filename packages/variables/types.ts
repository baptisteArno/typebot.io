export type Variable = {
  id: string
  name: string
  value?: string | (string | null)[] | null | undefined
  isSessionVariable?: boolean
}

export type VariableWithValue = Omit<Variable, 'value'> & {
  value: string | (string | null)[]
}

export type VariableWithUnknowValue = Omit<Variable, 'value'> & {
  value?: unknown
}
