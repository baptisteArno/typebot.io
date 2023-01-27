import { executeScript } from '@/features/blocks/logic/script/executeScript'
import type { ScriptToExecute } from 'models'

export const executeChatwoot = (chatwoot: {
  scriptToExecute: ScriptToExecute
}) => {
  executeScript(chatwoot.scriptToExecute)
}
