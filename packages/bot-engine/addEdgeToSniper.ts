import { createId } from '@paralleldrive/cuid2'
import { SessionState, Edge } from '@sniper.io/schemas'

export const addEdgeToSniper = (
  state: SessionState,
  edge: Edge
): SessionState => ({
  ...state,
  snipersQueue: state.snipersQueue.map((sniper, index) =>
    index === 0
      ? {
          ...sniper,
          sniper: {
            ...sniper.sniper,
            edges: [...sniper.sniper.edges, edge],
          },
        }
      : sniper
  ),
})

export const createPortalEdge = ({ to }: Pick<Edge, 'to'>) => ({
  id: 'virtual-' + createId(),
  from: { blockId: '', groupId: '' },
  to,
})
