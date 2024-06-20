import { addEdgeToSniper, createPortalEdge } from '../../../addEdgeToSniper'
import { ExecuteLogicResponse } from '../../../types'
import { TRPCError } from '@trpc/server'
import { SessionState } from '@sniper.io/schemas'
import { JumpBlock } from '@sniper.io/schemas/features/blocks/logic/jump'

export const executeJumpBlock = (
  state: SessionState,
  { groupId, blockId }: JumpBlock['options'] = {}
): ExecuteLogicResponse => {
  if (!groupId) return { outgoingEdgeId: undefined }
  const { sniper } = state.snipersQueue[0]
  const groupToJumpTo = sniper.groups.find((group) => group.id === groupId)
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
  const newSessionState = addEdgeToSniper(state, portalEdge)

  return { outgoingEdgeId: portalEdge.id, newSessionState }
}
