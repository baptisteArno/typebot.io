import { LinkedSniper } from '@/providers/SniperProvider'
import { EdgeId, LogicState } from '@/types'
import { SniperLinkBlock, Edge, PublicSniper } from '@sniper.io/schemas'
import { fetchAndInjectSniper } from '../queries/fetchAndInjectSniperQuery'

export const executeSniperLink = async (
  block: SniperLinkBlock,
  context: LogicState
): Promise<{
  nextEdgeId?: EdgeId
  linkedSniper?: PublicSniper | LinkedSniper
}> => {
  const {
    sniper,
    linkedSnipers,
    onNewLog,
    createEdge,
    setCurrentSniperId,
    pushEdgeIdInLinkedSniperQueue,
    pushParentSniperId,
    currentSniperId,
  } = context
  const linkedSniper = (
    block.options?.sniperId === 'current'
      ? sniper
      : [sniper, ...linkedSnipers].find((sniper) =>
          'sniperId' in sniper
            ? sniper.sniperId === block.options?.sniperId
            : sniper.id === block.options?.sniperId
        ) ?? (await fetchAndInjectSniper(block, context))
  ) as PublicSniper | LinkedSniper | undefined
  if (!linkedSniper) {
    onNewLog({
      status: 'error',
      description: 'Failed to link sniper',
      details: '',
    })
    return { nextEdgeId: block.outgoingEdgeId }
  }
  if (block.outgoingEdgeId)
    pushEdgeIdInLinkedSniperQueue({
      edgeId: block.outgoingEdgeId,
      sniperId: currentSniperId,
    })
  pushParentSniperId(currentSniperId)
  setCurrentSniperId(
    'sniperId' in linkedSniper ? linkedSniper.sniperId : linkedSniper.id
  )
  const nextGroupId =
    block.options?.groupId ??
    linkedSniper.groups.find((b) => b.blocks.some((s) => s.type === 'start'))
      ?.id
  if (!nextGroupId) return { nextEdgeId: block.outgoingEdgeId }
  const newEdge: Edge = {
    id: (Math.random() * 1000).toString(),
    from: { blockId: '' },
    to: {
      groupId: nextGroupId,
    },
  }
  createEdge(newEdge)
  return {
    nextEdgeId: newEdge.id,
    linkedSniper: {
      ...linkedSniper,
      edges: [...linkedSniper.edges, newEdge],
    },
  }
}
