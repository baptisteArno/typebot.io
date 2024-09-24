import { ExecuteLogicResponse } from '../../../types'
import { SessionState } from '@typebot.io/schemas'
import { CloseChatBlock } from '@typebot.io/schemas/features/blocks/logic/closeChat'

export const executeCloseChatBlock = (
  _: SessionState,
  block: CloseChatBlock
): ExecuteLogicResponse => {
  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions: [
      {
        type: 'close',
      },
    ],
  }
}
