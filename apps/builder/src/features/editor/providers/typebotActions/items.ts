import {
  ItemIndices,
  Item,
  BlockWithItems,
  defaultConditionContent,
  Block,
  LogicBlockType,
  InputBlockType,
  ConditionItem,
  ButtonItem,
  PictureChoiceItem,
} from '@typebot.io/schemas'
import { SetTypebot } from '../TypebotProvider'
import { Draft, produce } from 'immer'
import { cleanUpEdgeDraft } from './edges'
import { byId, blockHasItems } from '@typebot.io/lib'
import { createId } from '@paralleldrive/cuid2'
import { DraggabbleItem } from '@/features/graph/providers/GraphDndProvider'

type NewItem = Pick<DraggabbleItem, 'blockId' | 'outgoingEdgeId' | 'type'> &
  Partial<DraggabbleItem>

type BlockWithCreatableItems = Extract<Block, { items: DraggabbleItem[] }>

export type ItemsActions = {
  createItem: (item: NewItem, indices: ItemIndices) => void
  duplicateItem: (indices: ItemIndices) => void
  updateItem: (indices: ItemIndices, updates: Partial<Omit<Item, 'id'>>) => void
  detachItemFromBlock: (indices: ItemIndices) => void
  deleteItem: (indices: ItemIndices) => void
}

const createItem = (
  block: Draft<BlockWithCreatableItems>,
  item: NewItem,
  itemIndex: number
): Item => {
  switch (block.type) {
    case LogicBlockType.CONDITION: {
      const baseItem = item as ConditionItem
      const newItem = {
        ...baseItem,
        id: 'id' in item && item.id ? item.id : createId(),
        content: baseItem.content ?? defaultConditionContent,
      }
      block.items.splice(itemIndex, 0, newItem)
      return newItem
    }
    case InputBlockType.CHOICE: {
      const baseItem = item as ButtonItem
      const newItem = {
        ...baseItem,
        id: 'id' in item && item.id ? item.id : createId(),
        content: baseItem.content,
      }
      block.items.splice(itemIndex, 0, newItem)
      return newItem
    }
    case InputBlockType.PICTURE_CHOICE: {
      const baseItem = item as PictureChoiceItem
      const newItem = {
        ...baseItem,
        id: 'id' in baseItem && item.id ? item.id : createId(),
      }
      block.items.splice(itemIndex, 0, newItem)
      return newItem
    }
  }
}

const duplicateItem = (
  block: Draft<BlockWithCreatableItems>,
  itemIndex: number
): Item => {
  const item = block.items[itemIndex]
  switch (block.type) {
    case LogicBlockType.CONDITION: {
      const baseItem = item as ConditionItem
      const newItem = {
        ...baseItem,
        id: createId(),
        content: baseItem.content ?? defaultConditionContent,
      }
      block.items.splice(itemIndex + 1, 0, newItem)
      return newItem
    }
    case InputBlockType.CHOICE: {
      const baseItem = item as ButtonItem
      const newItem = {
        ...baseItem,
        id: createId(),
        content: baseItem.content,
      }
      block.items.splice(itemIndex + 1, 0, newItem)
      return newItem
    }
    case InputBlockType.PICTURE_CHOICE: {
      const baseItem = item as PictureChoiceItem
      const newItem = {
        ...baseItem,
        id: createId(),
      }
      block.items.splice(itemIndex + 1, 0, newItem)
      return newItem
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
        const block = typebot.groups[groupIndex].blocks[
          blockIndex
        ] as BlockWithCreatableItems

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
  duplicateItem: ({ groupIndex, blockIndex, itemIndex }: ItemIndices) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const block = typebot.groups[groupIndex].blocks[
          blockIndex
        ] as BlockWithCreatableItems
        duplicateItem(block, itemIndex)
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
