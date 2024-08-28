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

export type SetVariableHistoryItem = {
  resultId: string
  index: number
  blockId: string
  variableId: string
  value: string | (string | null)[] | null
}

export type SessionState = any
