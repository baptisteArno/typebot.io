export type Variable = {
  id: string
  name: string
  value?: string | number
}

export type VariableWithValue = Omit<Variable, 'value'> & {
  value: string
}
