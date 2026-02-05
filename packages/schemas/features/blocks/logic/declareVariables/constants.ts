import { DeclareVariablesBlock } from './schema'

export const defaultDeclareVariablesOptions = {
  variables: [],
} as const satisfies DeclareVariablesBlock['options']
