import { ConditionBlock, SessionState } from '@typebot.io/schemas'
import { ExecuteLogicResponse } from '@/features/chat/types'
import { executeCondition } from './executeCondition'

export const executeConditionBlock = (
  state: SessionState,
  block: ConditionBlock
): ExecuteLogicResponse => {
  const { variables } = state.typebotsQueue[0].typebot
  const passedCondition = block.items.find((item) =>
    executeCondition(variables)(item.content)
  )
  return {
    outgoingEdgeId: passedCondition
      ? passedCondition.outgoingEdgeId
      : block.outgoingEdgeId,
  }
}
