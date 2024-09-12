import { SessionState, AssignChatBlock } from '@typebot.io/schemas'
import { ExecuteLogicResponse } from '../../../types'

export const executeAssignChat = (
  state: SessionState,
  block: AssignChatBlock
): ExecuteLogicResponse => {
  console.log('Assigne Chat')
  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions: [
      {
        type: 'assign',
        assign: {
          assignType: block.options?.assignType || 'Agent',
          email: block.options?.email || '',
        },
      },
    ],
  }
}
