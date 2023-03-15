import { createId } from '@paralleldrive/cuid2'
import { SessionState, Edge } from '@typebot.io/schemas'

export const addEdgeToTypebot = (
  state: SessionState,
  edge: Edge
): SessionState => ({
  ...state,
  typebot: {
    ...state.typebot,
    edges: [...state.typebot.edges, edge],
  },
})

export const createPortalEdge = ({ to }: Pick<Edge, 'to'>) => ({
  id: createId(),
  from: { blockId: '', groupId: '' },
  to,
})
