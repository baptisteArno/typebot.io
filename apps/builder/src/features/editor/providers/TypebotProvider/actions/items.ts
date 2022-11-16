import {
  ItemIndices,
  Item,
  BlockWithItems,
  defaultConditionContent,
  ItemType,
} from 'models'
import { SetTypebot } from '../TypebotProvider'
import produce from 'immer'
import { cleanUpEdgeDraft } from './edges'
import { byId, blockHasItems } from 'utils'
import cuid from 'cuid'

export type ItemsActions = {
  createItem: (item: Item | Omit<Item, 'id'>, indices: ItemIndices) => void
  updateItem: (indices: ItemIndices, updates: Partial<Omit<Item, 'id'>>) => void
  detachItemFromBlock: (indices: ItemIndices) => void
  deleteItem: (indices: ItemIndices) => void
}

const itemsAction = (setTypebot: SetTypebot): ItemsActions => ({
  createItem: (
    item: Item | Omit<Item, 'id'>,
    { groupIndex, blockIndex, itemIndex }: ItemIndices
  ) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const block = typebot.groups[groupIndex].blocks[
          blockIndex
        ] as BlockWithItems

        const newItem = {
          id: 'id' in item ? item.id : cuid(),
          content:
            item.type === ItemType.CONDITION
              ? defaultConditionContent
              : undefined,
          ...item,
        } as Item
        if (item.outgoingEdgeId) {
          const edgeIndex = typebot.edges.findIndex(byId(item.outgoingEdgeId))
          edgeIndex !== -1
            ? (typebot.edges[edgeIndex].from = {
                groupId: block.groupId,
                blockId: block.id,
                itemId: newItem.id,
              })
            : (newItem.outgoingEdgeId = undefined)
        }
        block.items.splice(itemIndex, 0, newItem)
      })
    ),
  updateItem: (
    { groupIndex, blockIndex, itemIndex }: ItemIndices,
    updates: Partial<Omit<Item, 'id'>>
  ) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const block = typebot.groups[groupIndex].blocks[blockIndex]
        if (!blockHasItems(block)) return
        ;(
          typebot.groups[groupIndex].blocks[blockIndex] as BlockWithItems
        ).items[itemIndex] = {
          ...block.items[itemIndex],
          ...updates,
        } as Item
      })
    ),
  detachItemFromBlock: ({ groupIndex, blockIndex, itemIndex }: ItemIndices) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const block = typebot.groups[groupIndex].blocks[
          blockIndex
        ] as BlockWithItems
        block.items.splice(itemIndex, 1)
      })
    ),
  deleteItem: ({ groupIndex, blockIndex, itemIndex }: ItemIndices) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const block = typebot.groups[groupIndex].blocks[
          blockIndex
        ] as BlockWithItems
        const removingItem = block.items[itemIndex]
        block.items.splice(itemIndex, 1)
        cleanUpEdgeDraft(typebot, removingItem.id)
      })
    ),
})

const duplicateItemDraft = (blockId: string) => (item: Item) => ({
  ...item,
  id: cuid(),
  blockId,
  outgoingEdgeId: undefined,
})

export { itemsAction, duplicateItemDraft }
