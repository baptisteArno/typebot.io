import { createId } from '@paralleldrive/cuid2'
import { SessionState, Edge } from '@typebot.io/schemas'

export const addEdgeToTypebot = (
  state: SessionState,
  edge: Edge
): SessionState => ({
  ...state,
  typebotsQueue: state.typebotsQueue.map((typebot, index) =>
    index === 0
      ? {
          ...typebot,
          typebot: {
            ...typebot.typebot,
            edges: [...typebot.typebot.edges, edge],
          },
        }
      : typebot
  ),
})

export const createPortalEdge = ({ to }: Pick<Edge, 'to'>) => ({
  id: 'virtual-' + createId(),
  from: { blockId: '', groupId: '' },
  to,
})
