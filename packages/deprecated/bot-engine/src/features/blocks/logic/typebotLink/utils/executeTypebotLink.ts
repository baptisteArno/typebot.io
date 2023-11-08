import { LinkedTypebot } from '@/providers/TypebotProvider'
import { EdgeId, LogicState } from '@/types'
import { TypebotLinkBlock, Edge, PublicTypebot } from '@typebot.io/schemas'
import { fetchAndInjectTypebot } from '../queries/fetchAndInjectTypebotQuery'

export const executeTypebotLink = async (
  block: TypebotLinkBlock,
  context: LogicState
): Promise<{
  nextEdgeId?: EdgeId
  linkedTypebot?: PublicTypebot | LinkedTypebot
}> => {
  const {
    typebot,
    linkedTypebots,
    onNewLog,
    createEdge,
    setCurrentTypebotId,
    pushEdgeIdInLinkedTypebotQueue,
    pushParentTypebotId,
    currentTypebotId,
  } = context
  const linkedTypebot = (
    block.options?.typebotId === 'current'
      ? typebot
      : [typebot, ...linkedTypebots].find((typebot) =>
          'typebotId' in typebot
            ? typebot.typebotId === block.options?.typebotId
            : typebot.id === block.options?.typebotId
        ) ?? (await fetchAndInjectTypebot(block, context))
  ) as PublicTypebot | LinkedTypebot | undefined
  if (!linkedTypebot) {
    onNewLog({
      status: 'error',
      description: 'Failed to link typebot',
      details: '',
    })
    return { nextEdgeId: block.outgoingEdgeId }
  }
  if (block.outgoingEdgeId)
    pushEdgeIdInLinkedTypebotQueue({
      edgeId: block.outgoingEdgeId,
      typebotId: currentTypebotId,
    })
  pushParentTypebotId(currentTypebotId)
  setCurrentTypebotId(
    'typebotId' in linkedTypebot ? linkedTypebot.typebotId : linkedTypebot.id
  )
  const nextGroupId =
    block.options?.groupId ??
    linkedTypebot.groups.find((b) => b.blocks.some((s) => s.type === 'start'))
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
    linkedTypebot: {
      ...linkedTypebot,
      edges: [...linkedTypebot.edges, newEdge],
    },
  }
}
