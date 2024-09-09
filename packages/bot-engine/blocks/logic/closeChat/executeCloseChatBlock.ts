import { addEdgeToTypebot, createPortalEdge } from '../../../addEdgeToTypebot'
import { ExecuteLogicResponse } from '../../../types'
import { TRPCError } from '@trpc/server'
import { SessionState } from '@typebot.io/schemas'
import { CloseChatBlock } from '@typebot.io/schemas/features/blocks/logic/closeChat'

export const executeCloseChatBlock = (
  state: SessionState
): any => {
  console.log('Chat is Closed')
  return {
    message: "Close Chat"
  }
}
