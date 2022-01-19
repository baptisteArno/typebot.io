import { Typebot, Edge, ConditionStep } from 'models'
import { Updater } from 'use-immer'
import { WritableDraft } from 'immer/dist/types/types-external'
import { generate } from 'short-uuid'

export type EdgesActions = {
  createEdge: (edge: Omit<Edge, 'id'>) => void
  updateEdge: (edgeId: string, updates: Partial<Omit<Edge, 'id'>>) => void
  deleteEdge: (edgeId: string) => void
}

export const edgesAction = (setTypebot: Updater<Typebot>): EdgesActions => ({
  createEdge: (edge: Omit<Edge, 'id'>) => {
    setTypebot((typebot) => {
      const newEdge = {
        ...edge,
        id: generate(),
      }
      if (edge.from.nodeId) {
        deleteEdgeDraft(
          typebot,
          typebot.choiceItems.byId[edge.from.nodeId].edgeId
        )
        typebot.choiceItems.byId[edge.from.nodeId].edgeId = newEdge.id
      } else if (edge.from.conditionType === 'true') {
        deleteEdgeDraft(
          typebot,
          (typebot.steps.byId[edge.from.stepId] as ConditionStep).trueEdgeId
        )
        ;(typebot.steps.byId[edge.from.stepId] as ConditionStep).trueEdgeId =
          newEdge.id
      } else if (edge.from.conditionType === 'false') {
        deleteEdgeDraft(
          typebot,
          (typebot.steps.byId[edge.from.stepId] as ConditionStep).falseEdgeId
        )
        ;(typebot.steps.byId[edge.from.stepId] as ConditionStep).falseEdgeId =
          newEdge.id
      } else {
        deleteEdgeDraft(typebot, typebot.steps.byId[edge.from.stepId].edgeId)
        typebot.steps.byId[edge.from.stepId].edgeId = newEdge.id
      }
      typebot.edges.byId[newEdge.id] = newEdge
      typebot.edges.allIds.push(newEdge.id)
    })
  },
  updateEdge: (edgeId: string, updates: Partial<Omit<Edge, 'id'>>) =>
    setTypebot((typebot) => {
      typebot.edges.byId[edgeId] = {
        ...typebot.edges.byId[edgeId],
        ...updates,
      }
    }),
  deleteEdge: (edgeId: string) => {
    setTypebot((typebot) => {
      deleteEdgeDraft(typebot, edgeId)
    })
  },
})

export const deleteEdgeDraft = (
  typebot: WritableDraft<Typebot>,
  edgeId?: string
) => {
  if (!edgeId) return
  delete typebot.edges.byId[edgeId]
  const index = typebot.edges.allIds.indexOf(edgeId)
  if (index !== -1) typebot.edges.allIds.splice(index, 1)
}
