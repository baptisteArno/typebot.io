export type Variable = {
  id: string
  variableId: string | undefined
  domain: "PERSON" | "ORGANIZATION" | "CHAT"
  name: string
  token: string
  type: string | undefined
  value?: string | number
  fieldId: string
  example: string | undefined
}

export type VariableWithValue = Omit<Variable, 'value'> & {
  value: string
}

export type VariableLight = {
  domain: "PERSON" | "ORGANIZATION" | "CHAT"
  name: string
  token: string
  type: string | undefined
}
