import { addEdgeToTypebot, createPortalEdge } from '../../../addEdgeToTypebot'
import { ExecuteLogicResponse } from '../../../types'
import { TRPCError } from '@trpc/server'
import { SessionState } from '@typebot.io/schemas'
import { JumpBlock } from '@typebot.io/schemas/features/blocks/logic/jump'

export const executeJumpBlock = (
  state: SessionState,
  { groupId, blockId }: JumpBlock['options'] = {}
): ExecuteLogicResponse => {
  if (!groupId) return { outgoingEdgeId: undefined }
  const { typebot } = state.typebotsQueue[0]
  const groupToJumpTo = typebot.groups.find((group) => group.id === groupId)
  const blockToJumpTo =
    groupToJumpTo?.blocks.find((block) => block.id === blockId) ??
    groupToJumpTo?.blocks[0]

  if (!blockToJumpTo) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Block to jump to is not found. groupId: ${
        groupId ?? 'undefined'
      }, blockId: ${blockId ?? 'undefined'}`,
    })
  }

  const portalEdge = createPortalEdge({
    to: { groupId, blockId: blockToJumpTo?.id },
  })
  const newSessionState = addEdgeToTypebot(state, portalEdge)

  return { outgoingEdgeId: portalEdge.id, newSessionState }
}
