import { executeCode } from '@/features/blocks/logic/code'
import type { CodeToExecute } from 'models'

export const executeChatwoot = (chatwoot: { codeToExecute: CodeToExecute }) => {
  executeCode(chatwoot.codeToExecute)
}
