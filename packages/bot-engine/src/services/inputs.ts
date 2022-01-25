import { ChoiceInputStep, ChoiceItem, Table } from 'models'

export const getSingleChoiceTargetId = (
  currentStep: ChoiceInputStep,
  choiceItems: Table<ChoiceItem>,
  answerContent?: string
): string | undefined => {
  const itemId = currentStep.options.itemIds.find(
    (itemId) => choiceItems.byId[itemId].content === answerContent
  )
  if (!itemId) throw new Error('itemId should exist')
  return choiceItems.byId[itemId].edgeId ?? currentStep.edgeId
}
