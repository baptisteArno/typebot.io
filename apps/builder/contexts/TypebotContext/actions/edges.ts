import {
  Typebot,
  Edge,
  StepWithItems,
  StepIndices,
  ItemIndices,
  Step,
} from 'models'
import { WritableDraft } from 'immer/dist/types/types-external'
import { SetTypebot } from '../TypebotContext'
import { produce } from 'immer'
import { byId, isDefined, stepHasItems } from 'utils'
import cuid from 'cuid'

import { updateBlocksHasConnections } from 'helpers/block-connections'

export type EdgesActions = {
  createEdge: (edge: Omit<Edge, 'id'>) => void
  updateEdge: (edgeIndex: number, updates: Partial<Omit<Edge, 'id'>>) => void
  deleteEdge: (edgeId: string) => void
}

export const edgesAction = (setTypebot: SetTypebot): EdgesActions => ({
  createEdge: (edge: Omit<Edge, 'id'>) => {
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const newEdge = {
          ...edge,
          id: cuid(),
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

        if (isDefined(itemIndex) && itemIndex !== -1) {
          addEdgeIdToItem(typebot, newEdge.id, {
            blockIndex,
            stepIndex,
            itemIndex,
          })
        } else {
          addEdgeIdToStep(typebot, newEdge.id, {
            blockIndex,
            stepIndex,
          })
        }

        typebot.blocks = updateBlocksHasConnections(typebot)
      })
    )
  },
  updateEdge: (edgeIndex: number, updates: Partial<Omit<Edge, 'id'>>) => {
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const currentEdge = typebot.edges[edgeIndex]

        typebot.edges[edgeIndex] = {
          ...currentEdge,
          ...updates,
        }

        typebot.blocks = updateBlocksHasConnections(typebot)
      })
    )
  },
  deleteEdge: (edgeId: string) => {
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        deleteEdgeDraft(typebot, edgeId)

        typebot.blocks = updateBlocksHasConnections(typebot)
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
) =>
  ((typebot.blocks[blockIndex].steps[stepIndex] as StepWithItems).items[
    itemIndex
  ].outgoingEdgeId = edgeId)

export const deleteEdgeDraft = (
  typebot: WritableDraft<Typebot>,
  edgeId: string
) => {
  const edgeIndex = typebot.edges.findIndex(byId(edgeId))

  if (edgeIndex === -1) return

  deleteOutgoingEdgeIdProps(typebot, edgeId)

  typebot.edges.splice(edgeIndex, 1)
}

const deleteOutgoingEdgeIdProps = (
  typebot: WritableDraft<Typebot>,
  edgeId: string
) => {
  const edge = typebot.edges.find(byId(edgeId))

  if (!edge) return

  const fromBlockIndex = typebot.blocks.findIndex(byId(edge.from.blockId))

  const fromStepIndex = typebot.blocks[fromBlockIndex].steps.findIndex(
    byId(edge.from.stepId)
  )

  const step = typebot.blocks[fromBlockIndex].steps[fromStepIndex] as
    | Step
    | undefined

  const fromItemIndex =
    edge.from.itemId && step && stepHasItems(step)
      ? step.items.findIndex(byId(edge.from.itemId))
      : -1

  if (fromStepIndex !== -1)
    typebot.blocks[fromBlockIndex].steps[fromStepIndex].outgoingEdgeId =
      undefined

  if (fromItemIndex !== -1)
    (
      typebot.blocks[fromBlockIndex].steps[fromStepIndex] as StepWithItems
    ).items[fromItemIndex].outgoingEdgeId = undefined
}

export const cleanUpEdgeDraft = (
  typebot: WritableDraft<Typebot>,
  deletedNodeId: string
) => {
  const edgesToDelete = typebot.edges.filter((edge) =>
    [
      edge.from.blockId,
      edge.from.stepId,
      edge.from.itemId,
      edge.to.blockId,
      edge.to.stepId,
    ].includes(deletedNodeId)
  )

  edgesToDelete.forEach((edge) => deleteEdgeDraft(typebot, edge.id))
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
