import { Typebot, Edge, ConditionStep } from 'models'
import { WritableDraft } from 'immer/dist/types/types-external'
import { generate } from 'short-uuid'
import { SetTypebot } from '../TypebotContext'
import { produce } from 'immer'

export type EdgesActions = {
  createEdge: (edge: Omit<Edge, 'id'>) => void
  updateEdge: (edgeId: string, updates: Partial<Omit<Edge, 'id'>>) => void
  deleteEdge: (edgeId: string) => void
}

export const edgesAction = (
  typebot: Typebot,
  setTypebot: SetTypebot
): EdgesActions => ({
  createEdge: (edge: Omit<Edge, 'id'>) => {
    setTypebot(
      produce(typebot, (typebot) => {
        const newEdge = {
          ...edge,
          id: generate(),
        }
        if (edge.from.buttonId) {
          deleteEdgeDraft(
            typebot,
            typebot.choiceItems.byId[edge.from.buttonId].edgeId
          )
          typebot.choiceItems.byId[edge.from.buttonId].edgeId = newEdge.id
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
    )
  },
  updateEdge: (edgeId: string, updates: Partial<Omit<Edge, 'id'>>) =>
    setTypebot(
      produce(typebot, (typebot) => {
        typebot.edges.byId[edgeId] = {
          ...typebot.edges.byId[edgeId],
          ...updates,
        }
      })
    ),
  deleteEdge: (edgeId: string) => {
    setTypebot(
      produce(typebot, (typebot) => {
        deleteEdgeDraft(typebot, edgeId)
      })
    )
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
