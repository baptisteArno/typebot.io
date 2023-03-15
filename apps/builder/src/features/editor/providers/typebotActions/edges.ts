import {
  Typebot,
  Edge,
  BlockWithItems,
  BlockIndices,
  ItemIndices,
  Block,
} from '@typebot.io/schemas'
import { WritableDraft } from 'immer/dist/types/types-external'
import { SetTypebot } from '../TypebotProvider'
import { produce } from 'immer'
import { byId, isDefined, blockHasItems } from '@typebot.io/lib'
import { createId } from '@paralleldrive/cuid2'

export type EdgesActions = {
  createEdge: (edge: Omit<Edge, 'id'>) => void
  updateEdge: (edgeIndex: number, updates: Partial<Omit<Edge, 'id'>>) => void
  deleteEdge: (edgeId: string) => void
}

export const edgesAction = (setTypebot: SetTypebot): EdgesActions => ({
  createEdge: (edge: Omit<Edge, 'id'>) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const newEdge = {
          ...edge,
          id: createId(),
        }
        removeExistingEdge(typebot, edge)
        typebot.edges.push(newEdge)
        const groupIndex = typebot.groups.findIndex(byId(edge.from.groupId))
        const blockIndex = typebot.groups[groupIndex].blocks.findIndex(
          byId(edge.from.blockId)
        )
        const itemIndex = edge.from.itemId
          ? (
              typebot.groups[groupIndex].blocks[blockIndex] as
                | BlockWithItems
                | undefined
            )?.items.findIndex(byId(edge.from.itemId))
          : null

        isDefined(itemIndex) && itemIndex !== -1
          ? addEdgeIdToItem(typebot, newEdge.id, {
              groupIndex,
              blockIndex,
              itemIndex,
            })
          : addEdgeIdToBlock(typebot, newEdge.id, {
              groupIndex,
              blockIndex,
            })
      })
    ),
  updateEdge: (edgeIndex: number, updates: Partial<Omit<Edge, 'id'>>) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const currentEdge = typebot.edges[edgeIndex]
        typebot.edges[edgeIndex] = {
          ...currentEdge,
          ...updates,
        }
      })
    ),
  deleteEdge: (edgeId: string) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        deleteEdgeDraft(typebot, edgeId)
      })
    ),
})

const addEdgeIdToBlock = (
  typebot: WritableDraft<Typebot>,
  edgeId: string,
  { groupIndex, blockIndex }: BlockIndices
) => {
  typebot.groups[groupIndex].blocks[blockIndex].outgoingEdgeId = edgeId
}

const addEdgeIdToItem = (
  typebot: WritableDraft<Typebot>,
  edgeId: string,
  { groupIndex, blockIndex, itemIndex }: ItemIndices
) =>
  ((typebot.groups[groupIndex].blocks[blockIndex] as BlockWithItems).items[
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
  const fromGroupIndex = typebot.groups.findIndex(byId(edge.from.groupId))
  const fromBlockIndex = typebot.groups[fromGroupIndex].blocks.findIndex(
    byId(edge.from.blockId)
  )
  const block = typebot.groups[fromGroupIndex].blocks[fromBlockIndex] as
    | Block
    | undefined
  if (!block) return
  const fromItemIndex =
    edge.from.itemId && blockHasItems(block)
      ? block.items.findIndex(byId(edge.from.itemId))
      : -1
  if (fromItemIndex !== -1) {
    ;(
      typebot.groups[fromGroupIndex].blocks[fromBlockIndex] as BlockWithItems
    ).items[fromItemIndex].outgoingEdgeId = undefined
  } else if (fromBlockIndex !== -1)
    typebot.groups[fromGroupIndex].blocks[fromBlockIndex].outgoingEdgeId =
      undefined
}

export const cleanUpEdgeDraft = (
  typebot: WritableDraft<Typebot>,
  deletedNodeId: string
) => {
  const edgesToDelete = typebot.edges.filter((edge) =>
    [
      edge.from.groupId,
      edge.from.blockId,
      edge.from.itemId,
      edge.to.groupId,
      edge.to.blockId,
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
      : isDefined(e.from.itemId) || e.from.blockId !== edge.from.blockId
  )
}
