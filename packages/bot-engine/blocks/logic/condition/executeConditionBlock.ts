import { ConditionBlock, SessionState } from '@typebot.io/schemas'
import { ExecuteLogicResponse } from '../../../types'
import { executeCondition } from './executeCondition'

export const executeConditionBlock = (
  state: SessionState,
  block: ConditionBlock
): ExecuteLogicResponse => {
  const { variables } = state.typebotsQueue[0].typebot
  const passedCondition = block.items.find(
    (item) => item.content && executeCondition(variables)(item.content)
  )
  return {
    outgoingEdgeId: passedCondition
      ? passedCondition.outgoingEdgeId
      : block.outgoingEdgeId,
  }
}
