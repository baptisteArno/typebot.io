import { ConditionBlock, SessionState } from '@typebot.io/schemas'
import { ExecuteLogicResponse } from '@/features/chat/types'
import { executeCondition } from './executeCondition'

export const executeConditionBlock = (
  { typebot: { variables } }: SessionState,
  block: ConditionBlock
): ExecuteLogicResponse => {
  const passedCondition = block.items.find((item) =>
    executeCondition(variables)(item.content)
  )
  return {
    outgoingEdgeId: passedCondition
      ? passedCondition.outgoingEdgeId
      : block.outgoingEdgeId,
  }
}
