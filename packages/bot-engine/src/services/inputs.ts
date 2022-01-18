import { ChoiceInputStep, ChoiceItem, Table, Target } from 'models'

export const getSingleChoiceTargetId = (
  currentStep: ChoiceInputStep,
  choiceItems: Table<ChoiceItem>,
  answerContent?: string
): Target | undefined => {
  const itemId = currentStep.options.itemIds.find(
    (itemId) => choiceItems.byId[itemId].content === answerContent
  )
  if (!itemId) throw new Error('itemId should exist')
  return choiceItems.byId[itemId].target ?? currentStep.target
}
