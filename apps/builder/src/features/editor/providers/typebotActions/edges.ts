import {
  Typebot,
  Edge,
  BlockWithItems,
  BlockIndices,
  ItemIndices,
  Block,
  TypebotV6,
} from '@typebot.io/schemas'
import { SetTypebot } from '../TypebotProvider'
import { Draft, produce } from 'immer'
import { byId, isDefined } from '@typebot.io/lib'
import { blockHasItems } from '@typebot.io/schemas/helpers'
import { createId } from '@paralleldrive/cuid2'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'

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
        if ('eventId' in edge.from) {
          const eventIndex = typebot.events.findIndex(byId(edge.from.eventId))
          addEdgeIdToEvent(typebot, newEdge.id, {
            eventIndex,
          })
        } else {
          const groupIndex = typebot.groups.findIndex((g) =>
            g.blocks.some(
              (b) => 'blockId' in edge.from && b.id === edge.from.blockId
            )
          )
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

          const block = typebot.groups[groupIndex].blocks[blockIndex]
          if (isDefined(itemIndex) && isDefined(block.outgoingEdgeId)) {
            const areAllItemsConnected = (block as BlockWithItems).items.every(
              (item) => isDefined(item.outgoingEdgeId)
            )
            if (
              areAllItemsConnected &&
              (block.type === InputBlockType.CHOICE ||
                block.type === InputBlockType.PICTURE_CHOICE)
            ) {
              deleteEdgeDraft({
                typebot,
                edgeId: block.outgoingEdgeId,
                groupIndex,
              })
            }
          }
        }
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
        deleteEdgeDraft({ typebot, edgeId })
      })
    ),
})

const addEdgeIdToEvent = (
  typebot: Draft<TypebotV6>,
  edgeId: string,
  { eventIndex }: { eventIndex: number }
) => (typebot.events[eventIndex].outgoingEdgeId = edgeId)

const addEdgeIdToBlock = (
  typebot: Draft<Typebot>,
  edgeId: string,
  { groupIndex, blockIndex }: BlockIndices
) => {
  typebot.groups[groupIndex].blocks[blockIndex].outgoingEdgeId = edgeId
}

const addEdgeIdToItem = (
  typebot: Draft<Typebot>,
  edgeId: string,
  { groupIndex, blockIndex, itemIndex }: ItemIndices
) =>
  ((typebot.groups[groupIndex].blocks[blockIndex] as BlockWithItems).items[
    itemIndex
  ].outgoingEdgeId = edgeId)

export const deleteEdgeDraft = ({
  typebot,
  edgeId,
  groupIndex,
}: {
  typebot: Draft<TypebotV6>
  edgeId: string
  groupIndex?: number
}) => {
  const edgeIndex = typebot.edges.findIndex(byId(edgeId))
  if (edgeIndex === -1) return
  deleteOutgoingEdgeIdProps({ typebot, edgeId, groupIndex })
  typebot.edges.splice(edgeIndex, 1)
}

const deleteOutgoingEdgeIdProps = ({
  typebot,
  edgeId,
  groupIndex,
}: {
  typebot: Draft<TypebotV6>
  edgeId: string
  groupIndex?: number
}) => {
  const edge = typebot.edges.find(byId(edgeId))
  if (!edge) return
  if ('eventId' in edge.from) {
    const eventIndex = typebot.events.findIndex(byId(edge.from.eventId))
    if (eventIndex === -1) return
    typebot.events[eventIndex].outgoingEdgeId = undefined
    return
  }
  const fromGroupIndex =
    groupIndex ??
    typebot.groups.findIndex(
      (g) =>
        edge.to.groupId === g.id ||
        g.blocks.some(
          (b) =>
            'blockId' in edge.from &&
            (b.id === edge.from.blockId || b.id === edge.to.blockId)
        )
    )
  const fromBlockIndex = typebot.groups[fromGroupIndex].blocks.findIndex(
    byId(edge.from.blockId)
  )
  const block = typebot.groups[fromGroupIndex].blocks[fromBlockIndex] as
    | Block
    | undefined
  if (!block) return
  const fromItemIndex =
    edge.from.itemId && blockHasItems(block)
      ? block.items?.findIndex(byId(edge.from.itemId))
      : -1
  if (fromItemIndex !== -1) {
    ;(
      typebot.groups[fromGroupIndex].blocks[fromBlockIndex] as BlockWithItems
    ).items[fromItemIndex ?? 0].outgoingEdgeId = undefined
  } else if (fromBlockIndex !== -1)
    typebot.groups[fromGroupIndex].blocks[fromBlockIndex].outgoingEdgeId =
      undefined
}

export const deleteConnectedEdgesDraft = (
  typebot: Draft<TypebotV6>,
  deletedNodeId: string
) => {
  const edgesToDelete = typebot.edges.filter((edge) => {
    if ('eventId' in edge.from)
      return [edge.from.eventId, edge.to.groupId, edge.to.blockId].includes(
        deletedNodeId
      )

    return [
      edge.from.blockId,
      edge.from.itemId,
      edge.to.groupId,
      edge.to.blockId,
    ].includes(deletedNodeId)
  })

  edgesToDelete.forEach((edge) => deleteEdgeDraft({ typebot, edgeId: edge.id }))
}

const removeExistingEdge = (
  typebot: Draft<Typebot>,
  edge: Omit<Edge, 'id'>
) => {
  typebot.edges = typebot.edges.filter((e) => {
    if ('eventId' in edge.from) {
      if ('eventId' in e.from) return e.from.eventId !== edge.from.eventId
      return true
    }

    if ('eventId' in e.from) return true

    return edge.from.itemId
      ? e.from && e.from.itemId !== edge.from.itemId
      : isDefined(e.from.itemId) || e.from.blockId !== edge.from.blockId
  })
}
