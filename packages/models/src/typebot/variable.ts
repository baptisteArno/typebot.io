export type Variable = {
  id?: string | undefined
  name: string
  value?: string | number
  fieldId: string
  domain: "PERSON" | "ORGANIZATION" | "CHAT"
  token: string
  type?: any
}

export type VariableWithValue = Omit<Variable, 'value'> & {
  value: string
}
