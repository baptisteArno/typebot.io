import { ScriptBlock } from './schema'

export const defaultScriptOptions = {
  name: 'Script',
  isExecutedOnClient: false,
} as const satisfies ScriptBlock['options']
