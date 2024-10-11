import { GlobalJumpBlock, SessionState } from '@typebot.io/schemas'
import { ExecuteLogicResponse } from '../../../types'
import { TRPCError } from '@trpc/server'
import { addEdgeToTypebot, createPortalEdge } from '../../../addEdgeToTypebot'

export const executeGlobalJumpBlock = (
  state: SessionState,
  { text, groupId, blockId }: GlobalJumpBlock['options'] = {}
): ExecuteLogicResponse => {
  if (!groupId || !text) return { outgoingEdgeId: undefined }
  const { typebot } = state.typebotsQueue[0]
  const groupToJumpTo = typebot.groups.find((group) => group.id === groupId)
  const blockToJumpTo =
    groupToJumpTo?.blocks.find((block) => block.id === blockId) ??
    groupToJumpTo?.blocks[0]

  if (!blockToJumpTo)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Block to jump to is not found',
    })

  const portalEdge = createPortalEdge({
    to: { groupId, blockId: blockToJumpTo?.id },
  })
  const newSessionState = addEdgeToTypebot(state, portalEdge)

  return { outgoingEdgeId: portalEdge.id, newSessionState }
}
