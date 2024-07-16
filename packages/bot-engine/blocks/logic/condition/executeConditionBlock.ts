import { ConditionBlock, SessionState } from '@typebot.io/schemas'
import { ExecuteLogicResponse } from '../../../types'
import { executeCondition } from '@typebot.io/logic/executeCondition'
export const executeConditionBlock = (
  state: SessionState,
  block: ConditionBlock
): ExecuteLogicResponse => {
  const { variables } = state.typebotsQueue[0].typebot
  const passedCondition = block.items.find(
    (item) =>
      item.content && executeCondition({ variables, condition: item.content })
  )
  return {
    outgoingEdgeId: passedCondition
      ? passedCondition.outgoingEdgeId
      : block.outgoingEdgeId,
  }
}
