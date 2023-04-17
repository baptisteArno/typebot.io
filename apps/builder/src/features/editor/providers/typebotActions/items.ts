import {
  ItemIndices,
  Item,
  BlockWithItems,
  defaultConditionContent,
  ItemType,
  Block,
  LogicBlockType,
  InputBlockType,
  ConditionItem,
  ButtonItem,
} from '@typebot.io/schemas'
import { SetTypebot } from '../TypebotProvider'
import produce from 'immer'
import { cleanUpEdgeDraft } from './edges'
import { byId, blockHasItems } from '@typebot.io/lib'
import { createId } from '@paralleldrive/cuid2'
import { WritableDraft } from 'immer/dist/types/types-external'

type NewItem = Pick<
  ConditionItem | ButtonItem,
  'blockId' | 'outgoingEdgeId' | 'type'
> &
  Partial<ConditionItem | ButtonItem>

export type ItemsActions = {
  createItem: (item: NewItem, indices: ItemIndices) => void
  updateItem: (indices: ItemIndices, updates: Partial<Omit<Item, 'id'>>) => void
  detachItemFromBlock: (indices: ItemIndices) => void
  deleteItem: (indices: ItemIndices) => void
}

const createItem = (
  block: WritableDraft<Block>,
  item: NewItem,
  itemIndex: number
) => {
  switch (block.type) {
    case LogicBlockType.CONDITION: {
      if (item.type === ItemType.CONDITION) {
        const newItem = {
          ...item,
          id: 'id' in item && item.id ? item.id : createId(),
          content: item.content ?? defaultConditionContent,
        }
        block.items.splice(itemIndex, 0, newItem)
        return newItem
      }
      break
    }
    case InputBlockType.CHOICE: {
      if (item.type === ItemType.BUTTON) {
        const newItem = {
          ...item,
          id: 'id' in item && item.id ? item.id : createId(),
          content: item.content,
        }
        block.items.splice(itemIndex, 0, newItem)
        return newItem
      }
      break
    }
  }
}

const itemsAction = (setTypebot: SetTypebot): ItemsActions => ({
  createItem: (
    item: NewItem,
    { groupIndex, blockIndex, itemIndex }: ItemIndices
  ) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const block = typebot.groups[groupIndex].blocks[blockIndex]

        const newItem = createItem(block, item, itemIndex)

        if (!newItem) return

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
  id: createId(),
  blockId,
  outgoingEdgeId: undefined,
})

export { itemsAction, duplicateItemDraft }
