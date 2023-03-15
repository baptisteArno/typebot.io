import {
  addEdgeToTypebot,
  createPortalEdge,
} from '@/features/chat/helpers/addEdgeToTypebot'
import { ExecuteLogicResponse } from '@/features/chat/types'
import { TRPCError } from '@trpc/server'
import { SessionState } from '@typebot.io/schemas'
import { JumpBlock } from '@typebot.io/schemas/features/blocks/logic/jump'

export const executeJumpBlock = (
  state: SessionState,
  { groupId, blockId }: JumpBlock['options']
): ExecuteLogicResponse => {
  const groupToJumpTo = state.typebot.groups.find(
    (group) => group.id === groupId
  )
  const blockToJumpTo =
    groupToJumpTo?.blocks.find((block) => block.id === blockId) ??
    groupToJumpTo?.blocks[0]

  if (!blockToJumpTo?.groupId)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Block to jump to is not found',
    })

  const portalEdge = createPortalEdge({
    to: { groupId: blockToJumpTo?.groupId, blockId: blockToJumpTo?.id },
  })
  const newSessionState = addEdgeToTypebot(state, portalEdge)

  return { outgoingEdgeId: portalEdge.id, newSessionState }
}
