import { SessionState, SetVariableBlock, Variable } from '@typebot.io/schemas'
import { byId } from '@typebot.io/lib'
import {
  parseVariables,
  parseCorrectValueType,
  updateVariables,
} from '@/features/variables'
import { ExecuteLogicResponse } from '@/features/chat'

export const executeSetVariable = async (
  state: SessionState,
  block: SetVariableBlock
): Promise<ExecuteLogicResponse> => {
  const { variables } = state.typebot
  if (!block.options?.variableId)
    return {
      outgoingEdgeId: block.outgoingEdgeId,
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
      return func(...variables.map((v) => parseCorrectValueType(v.value)))
    } catch (err) {
      return parseVariables(variables)(str)
    }
  }
