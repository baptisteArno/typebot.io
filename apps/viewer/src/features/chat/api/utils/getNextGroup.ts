import { byId } from '@typebot.io/lib'
import { Group, SessionState } from '@typebot.io/schemas'

export type NextGroup = {
  group: Group
  updatedContext?: SessionState
}

export const getNextGroup =
  (state: SessionState) =>
  (edgeId?: string): NextGroup | null => {
    const { typebot } = state
    const nextEdge = typebot.edges.find(byId(edgeId))
    if (!nextEdge) {
      if (state.linkedTypebots.queue.length > 0) {
        const nextEdgeId = state.linkedTypebots.queue[0].edgeId
        const updatedContext = {
          ...state,
          linkedBotQueue: state.linkedTypebots.queue.slice(1),
        }
        const nextGroup = getNextGroup(updatedContext)(nextEdgeId)
        if (!nextGroup) return null
        return {
          ...nextGroup,
          updatedContext,
        }
      }
      return null
    }
    const nextGroup = typebot.groups.find(byId(nextEdge.to.groupId))
    if (!nextGroup) return null
    const startBlockIndex = nextEdge.to.blockId
      ? nextGroup.blocks.findIndex(byId(nextEdge.to.blockId))
      : 0
    return {
      group: { ...nextGroup, blocks: nextGroup.blocks.slice(startBlockIndex) },
    }
  }
