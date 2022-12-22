import { executeCode } from '@/features/blocks/logic/code'
import { executeRedirect } from '@/features/blocks/logic/redirect'
import { ChatReply } from 'models'

export const executeLogic = async (logic: ChatReply['logic']) => {
  if (logic?.codeToExecute) {
    await executeCode(logic.codeToExecute)
  }
  if (logic?.redirect) {
    executeRedirect(logic.redirect)
  }
}
