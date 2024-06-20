import {
  Sniper,
  Edge,
  BlockWithItems,
  BlockIndices,
  ItemIndices,
  Block,
  SniperV6,
} from '@sniper.io/schemas'
import { SetSniper } from '../SniperProvider'
import { Draft, produce } from 'immer'
import { byId, isDefined } from '@sniper.io/lib'
import { blockHasItems } from '@sniper.io/schemas/helpers'
import { createId } from '@paralleldrive/cuid2'
import { InputBlockType } from '@sniper.io/schemas/features/blocks/inputs/constants'

export type EdgesActions = {
  createEdge: (edge: Omit<Edge, 'id'>) => void
  updateEdge: (edgeIndex: number, updates: Partial<Omit<Edge, 'id'>>) => void
  deleteEdge: (edgeId: string) => void
}

export const edgesAction = (setSniper: SetSniper): EdgesActions => ({
  createEdge: (edge: Omit<Edge, 'id'>) =>
    setSniper((sniper) =>
      produce(sniper, (sniper) => {
        const newEdge = {
          ...edge,
          id: createId(),
        }
        removeExistingEdge(sniper, edge)
        sniper.edges.push(newEdge)
        if ('eventId' in edge.from) {
          const eventIndex = sniper.events.findIndex(byId(edge.from.eventId))
          addEdgeIdToEvent(sniper, newEdge.id, {
            eventIndex,
          })
        } else {
          const groupIndex = sniper.groups.findIndex((g) =>
            g.blocks.some(
              (b) => 'blockId' in edge.from && b.id === edge.from.blockId
            )
          )
          const blockIndex = sniper.groups[groupIndex].blocks.findIndex(
            byId(edge.from.blockId)
          )
          const itemIndex = edge.from.itemId
            ? (
                sniper.groups[groupIndex].blocks[blockIndex] as
                  | BlockWithItems
                  | undefined
              )?.items.findIndex(byId(edge.from.itemId))
            : null

          isDefined(itemIndex) && itemIndex !== -1
            ? addEdgeIdToItem(sniper, newEdge.id, {
                groupIndex,
                blockIndex,
                itemIndex,
              })
            : addEdgeIdToBlock(sniper, newEdge.id, {
                groupIndex,
                blockIndex,
              })

          const block = sniper.groups[groupIndex].blocks[blockIndex]
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
                sniper,
                edgeId: block.outgoingEdgeId,
                groupIndex,
              })
            }
          }
        }
      })
    ),
  updateEdge: (edgeIndex: number, updates: Partial<Omit<Edge, 'id'>>) =>
    setSniper((sniper) =>
      produce(sniper, (sniper) => {
        const currentEdge = sniper.edges[edgeIndex]
        sniper.edges[edgeIndex] = {
          ...currentEdge,
          ...updates,
        }
      })
    ),
  deleteEdge: (edgeId: string) =>
    setSniper((sniper) =>
      produce(sniper, (sniper) => {
        deleteEdgeDraft({ sniper, edgeId })
      })
    ),
})

const addEdgeIdToEvent = (
  sniper: Draft<SniperV6>,
  edgeId: string,
  { eventIndex }: { eventIndex: number }
) => (sniper.events[eventIndex].outgoingEdgeId = edgeId)

const addEdgeIdToBlock = (
  sniper: Draft<Sniper>,
  edgeId: string,
  { groupIndex, blockIndex }: BlockIndices
) => {
  sniper.groups[groupIndex].blocks[blockIndex].outgoingEdgeId = edgeId
}

const addEdgeIdToItem = (
  sniper: Draft<Sniper>,
  edgeId: string,
  { groupIndex, blockIndex, itemIndex }: ItemIndices
) =>
  ((sniper.groups[groupIndex].blocks[blockIndex] as BlockWithItems).items[
    itemIndex
  ].outgoingEdgeId = edgeId)

export const deleteEdgeDraft = ({
  sniper,
  edgeId,
  groupIndex,
}: {
  sniper: Draft<SniperV6>
  edgeId: string
  groupIndex?: number
}) => {
  const edgeIndex = sniper.edges.findIndex(byId(edgeId))
  if (edgeIndex === -1) return
  deleteOutgoingEdgeIdProps({ sniper, edgeId, groupIndex })
  sniper.edges.splice(edgeIndex, 1)
}

const deleteOutgoingEdgeIdProps = ({
  sniper,
  edgeId,
  groupIndex,
}: {
  sniper: Draft<SniperV6>
  edgeId: string
  groupIndex?: number
}) => {
  const edge = sniper.edges.find(byId(edgeId))
  if (!edge) return
  if ('eventId' in edge.from) {
    const eventIndex = sniper.events.findIndex(byId(edge.from.eventId))
    if (eventIndex === -1) return
    sniper.events[eventIndex].outgoingEdgeId = undefined
    return
  }
  const fromGroupIndex =
    groupIndex ??
    sniper.groups.findIndex(
      (g) =>
        edge.to.groupId === g.id ||
        g.blocks.some(
          (b) =>
            'blockId' in edge.from &&
            (b.id === edge.from.blockId || b.id === edge.to.blockId)
        )
    )
  const fromBlockIndex = sniper.groups[fromGroupIndex].blocks.findIndex(
    byId(edge.from.blockId)
  )
  const block = sniper.groups[fromGroupIndex].blocks[fromBlockIndex] as
    | Block
    | undefined
  if (!block) return
  const fromItemIndex =
    edge.from.itemId && blockHasItems(block)
      ? block.items?.findIndex(byId(edge.from.itemId))
      : -1
  if (fromItemIndex !== -1) {
    ;(
      sniper.groups[fromGroupIndex].blocks[fromBlockIndex] as BlockWithItems
    ).items[fromItemIndex ?? 0].outgoingEdgeId = undefined
  } else if (fromBlockIndex !== -1)
    sniper.groups[fromGroupIndex].blocks[fromBlockIndex].outgoingEdgeId =
      undefined
}

export const deleteConnectedEdgesDraft = (
  sniper: Draft<SniperV6>,
  deletedNodeId: string
) => {
  const edgesToDelete = sniper.edges.filter((edge) => {
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

  edgesToDelete.forEach((edge) => deleteEdgeDraft({ sniper, edgeId: edge.id }))
}

const removeExistingEdge = (sniper: Draft<Sniper>, edge: Omit<Edge, 'id'>) => {
  sniper.edges = sniper.edges.filter((e) => {
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
