import { ScriptBlock } from './schema'

export const defaultScriptOptions = {
  name: 'Script',
} as const satisfies ScriptBlock['options']
