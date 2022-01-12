import { ChoiceItem, InputStepType, Typebot } from 'models'
import { Updater } from 'use-immer'
import { WritableDraft } from 'immer/dist/types/types-external'
import { generate } from 'short-uuid'
import assert from 'assert'

export type ChoiceItemsActions = {
  createChoiceItem: (
    item: ChoiceItem | Pick<ChoiceItem, 'stepId'>,
    index?: number
  ) => void
  updateChoiceItem: (
    itemId: string,
    updates: Partial<Omit<ChoiceItem, 'id'>>
  ) => void
  deleteChoiceItem: (itemId: string) => void
}

export const choiceItemsAction = (
  setTypebot: Updater<Typebot>
): ChoiceItemsActions => ({
  createChoiceItem: (
    item: ChoiceItem | Pick<ChoiceItem, 'stepId'>,
    index?: number
  ) => {
    setTypebot((typebot) => {
      createChoiceItemDraft(typebot, item, index)
    })
  },
  updateChoiceItem: (
    itemId: string,
    updates: Partial<Omit<ChoiceItem, 'id'>>
  ) =>
    setTypebot((typebot) => {
      typebot.choiceItems.byId[itemId] = {
        ...typebot.choiceItems.byId[itemId],
        ...updates,
      }
    }),
  deleteChoiceItem: (itemId: string) => {
    setTypebot((typebot) => {
      removeChoiceItemFromStep(typebot, itemId)
      deleteChoiceItemDraft(typebot, itemId)
    })
  },
})

const removeChoiceItemFromStep = (
  typebot: WritableDraft<Typebot>,
  itemId: string
) => {
  const containerStepId = typebot.choiceItems.byId[itemId].stepId
  const step = typebot.steps.byId[containerStepId]
  assert(step.type === InputStepType.CHOICE)
  step.options?.itemIds.splice(step.options.itemIds.indexOf(itemId), 1)
}

export const deleteChoiceItemDraft = (
  typebot: WritableDraft<Typebot>,
  itemId: string
) => {
  delete typebot.choiceItems.byId[itemId]
  const index = typebot.choiceItems.allIds.indexOf(itemId)
  if (index !== -1) typebot.choiceItems.allIds.splice(index, 1)
}

export const createChoiceItemDraft = (
  typebot: WritableDraft<Typebot>,
  item: ChoiceItem | Pick<ChoiceItem, 'stepId'>,
  index?: number
) => {
  const step = typebot.steps.byId[item.stepId]
  assert(step.type === InputStepType.CHOICE)
  const newItem: ChoiceItem =
    'id' in item ? { ...item } : { id: generate(), stepId: item.stepId }
  typebot.choiceItems.byId[newItem.id] = newItem
  typebot.choiceItems.allIds.push(newItem.id)
  step.options.itemIds.splice(index ?? 0, 0, newItem.id)
}
