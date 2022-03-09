import {
  ItemIndices,
  Item,
  InputStepType,
  StepWithItems,
  ButtonItem,
} from 'models'
import { SetTypebot } from '../TypebotContext'
import produce from 'immer'
import { cleanUpEdgeDraft } from './edges'
import { stepHasItems } from 'utils'
import { generate } from 'short-uuid'

export type ItemsActions = {
  createItem: (item: Omit<ButtonItem, 'id'>, indices: ItemIndices) => void
  updateItem: (indices: ItemIndices, updates: Partial<Omit<Item, 'id'>>) => void
  deleteItem: (indices: ItemIndices) => void
}

const itemsAction = (setTypebot: SetTypebot): ItemsActions => ({
  createItem: (
    item: Omit<ButtonItem, 'id'>,
    { blockIndex, stepIndex, itemIndex }: ItemIndices
  ) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const step = typebot.blocks[blockIndex].steps[stepIndex]
        if (step.type !== InputStepType.CHOICE) return
        step.items.splice(itemIndex, 0, {
          ...item,
          stepId: step.id,
          id: generate(),
        })
      })
    ),
  updateItem: (
    { blockIndex, stepIndex, itemIndex }: ItemIndices,
    updates: Partial<Omit<Item, 'id'>>
  ) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const step = typebot.blocks[blockIndex].steps[stepIndex]
        if (!stepHasItems(step)) return
        ;(typebot.blocks[blockIndex].steps[stepIndex] as StepWithItems).items[
          itemIndex
        ] = {
          ...step.items[itemIndex],
          ...updates,
        } as Item
      })
    ),

  deleteItem: ({ blockIndex, stepIndex, itemIndex }: ItemIndices) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const step = typebot.blocks[blockIndex].steps[
          stepIndex
        ] as StepWithItems
        const removingItem = step.items[itemIndex]
        step.items.splice(itemIndex, 1)
        cleanUpEdgeDraft(typebot, removingItem.id)
      })
    ),
})

export { itemsAction }
