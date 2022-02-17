export type Variable = {
  id: string
  name: string
  value?: string
}

export type VariableWithValue = Omit<Variable, 'value'> & {
  value: string
}
