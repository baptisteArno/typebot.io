import { SessionState, SetVariableBlock, Variable } from '@typebot.io/schemas'
import { byId } from '@typebot.io/lib'
import { ExecuteLogicResponse } from '@/features/chat/types'
import { updateVariables } from '@/features/variables/updateVariables'
import { parseVariables } from '@/features/variables/parseVariables'
import { parseGuessedValueType } from '@/features/variables/parseGuessedValueType'
import { parseScriptToExecuteClientSideAction } from '../script/executeScript'

export const executeSetVariable = async (
  state: SessionState,
  block: SetVariableBlock,
  lastBubbleBlockId?: string
): Promise<ExecuteLogicResponse> => {
  const { variables } = state.typebot
  if (!block.options?.variableId)
    return {
      outgoingEdgeId: block.outgoingEdgeId,
    }
  if (block.options.isExecutedOnClient && block.options.expressionToEvaluate) {
    const scriptToExecute = parseScriptToExecuteClientSideAction(
      state.typebot.variables,
      block.options.expressionToEvaluate
    )
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      clientSideActions: [
        {
          setVariable: {
            scriptToExecute,
          },
          lastBubbleBlockId,
        },
      ],
    }
  }
  const evaluatedExpression = block.options.expressionToEvaluate
    ? evaluateSetVariableExpression(variables)(
        block.options.expressionToEvaluate
      )
    : undefined
  const existingVariable = variables.find(byId(block.options.variableId))
  if (!existingVariable) return { outgoingEdgeId: block.outgoingEdgeId }
  const newVariable = {
    ...existingVariable,
    value: evaluatedExpression,
  }
  const newSessionState = await updateVariables(state)([newVariable])
  return {
    outgoingEdgeId: block.outgoingEdgeId,
    newSessionState,
  }
}

const evaluateSetVariableExpression =
  (variables: Variable[]) =>
  (str: string): unknown => {
    const isSingleVariable =
      str.startsWith('{{') && str.endsWith('}}') && str.split('{{').length === 2
    if (isSingleVariable) return parseVariables(variables)(str)
    const evaluating = parseVariables(variables, { fieldToParse: 'id' })(
      str.includes('return ') ? str : `return ${str}`
    )
    try {
      const func = Function(...variables.map((v) => v.id), evaluating)
      return func(...variables.map((v) => parseGuessedValueType(v.value)))
    } catch (err) {
      return parseVariables(variables)(str)
    }
  }
