import { ConditionBlock, SessionState } from '@sniper.io/schemas'
import { ExecuteLogicResponse } from '../../../types'
import { executeCondition } from '@sniper.io/logic/executeCondition'
export const executeConditionBlock = (
  state: SessionState,
  block: ConditionBlock
): ExecuteLogicResponse => {
  const { variables } = state.snipersQueue[0].sniper
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
