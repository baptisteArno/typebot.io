import { Typebot, Edge, StepWithItems, StepIndices, ItemIndices } from 'models'
import { WritableDraft } from 'immer/dist/types/types-external'
import { generate } from 'short-uuid'
import { SetTypebot } from '../TypebotContext'
import { produce } from 'immer'
import { byId, isDefined, stepHasItems } from 'utils'

export type EdgesActions = {
  createEdge: (edge: Omit<Edge, 'id'>) => void
  updateEdge: (edgeIndex: number, updates: Partial<Omit<Edge, 'id'>>) => void
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
        removeExistingEdge(typebot, edge)
        typebot.edges.push(newEdge)
        const blockIndex = typebot.blocks.findIndex(byId(edge.from.blockId))
        const stepIndex = typebot.blocks[blockIndex].steps.findIndex(
          byId(edge.from.stepId)
        )
        const itemIndex = edge.from.itemId
          ? (
              typebot.blocks[blockIndex].steps[stepIndex] as StepWithItems
            ).items.findIndex(byId(edge.from.itemId))
          : null

        isDefined(itemIndex)
          ? addEdgeIdToItem(typebot, newEdge.id, {
              blockIndex,
              stepIndex,
              itemIndex,
            })
          : addEdgeIdToStep(typebot, newEdge.id, {
              blockIndex,
              stepIndex,
            })
      })
    )
  },
  updateEdge: (edgeIndex: number, updates: Partial<Omit<Edge, 'id'>>) =>
    setTypebot(
      produce(typebot, (typebot) => {
        const currentEdge = typebot.edges[edgeIndex]
        typebot.edges[edgeIndex] = {
          ...currentEdge,
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

const addEdgeIdToStep = (
  typebot: WritableDraft<Typebot>,
  edgeId: string,
  { blockIndex, stepIndex }: StepIndices
) => {
  typebot.blocks[blockIndex].steps[stepIndex].outgoingEdgeId = edgeId
}

const addEdgeIdToItem = (
  typebot: WritableDraft<Typebot>,
  edgeId: string,
  { blockIndex, stepIndex, itemIndex }: ItemIndices
) => {
  ;(typebot.blocks[blockIndex].steps[stepIndex] as StepWithItems).items[
    itemIndex
  ].outgoingEdgeId = edgeId
}

export const deleteEdgeDraft = (
  typebot: WritableDraft<Typebot>,
  edgeId: string
) => {
  const edgeIndex = typebot.edges.findIndex(byId(edgeId))
  if (edgeIndex === -1) return
  deleteOutgoingEdgeIdProps(typebot, edgeIndex)
  typebot.edges.splice(edgeIndex, 1)
}

const deleteOutgoingEdgeIdProps = (
  typebot: WritableDraft<Typebot>,
  edgeIndex: number
) => {
  const edge = typebot.edges[edgeIndex]
  const fromBlockIndex = typebot.blocks.findIndex(byId(edge.from.blockId))
  const fromStepIndex = typebot.blocks[fromBlockIndex].steps.findIndex(
    byId(edge.from.stepId)
  )
  const step = typebot.blocks[fromBlockIndex].steps[fromStepIndex]
  const fromItemIndex =
    edge.from.itemId && stepHasItems(step)
      ? step.items.findIndex(byId(edge.from.itemId))
      : -1
  if (fromStepIndex !== -1)
    typebot.blocks[fromBlockIndex].steps[fromStepIndex].outgoingEdgeId =
      undefined
  if (fromItemIndex !== -1) {
    ;(
      typebot.blocks[fromBlockIndex].steps[fromStepIndex] as StepWithItems
    ).items[fromItemIndex].outgoingEdgeId = undefined
  }
}

export const cleanUpEdgeDraft = (
  typebot: WritableDraft<Typebot>,
  deletedNodeId: string
) => {
  typebot.edges = typebot.edges.filter(
    (edge) =>
      ![
        edge.from.blockId,
        edge.from.stepId,
        edge.from.itemId,
        edge.to.blockId,
        edge.to.stepId,
      ].includes(deletedNodeId)
  )
}

const removeExistingEdge = (
  typebot: WritableDraft<Typebot>,
  edge: Omit<Edge, 'id'>
) => {
  typebot.edges = typebot.edges.filter((e) =>
    edge.from.itemId
      ? e.from.itemId !== edge.from.itemId
      : isDefined(e.from.itemId) || e.from.stepId !== edge.from.stepId
  )
}
