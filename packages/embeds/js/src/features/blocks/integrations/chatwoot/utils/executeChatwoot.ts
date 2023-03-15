import { executeScript } from '@/features/blocks/logic/script/executeScript'
import type { ScriptToExecute } from '@typebot.io/schemas'

export const executeChatwoot = (chatwoot: {
  scriptToExecute: ScriptToExecute
}) => {
  executeScript(chatwoot.scriptToExecute)
}
