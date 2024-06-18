import { SetVariableBlock, Variable } from '@sniper.io/schemas'
import { byId } from '@sniper.io/lib'
import { EdgeId, LogicState } from '@/types'
import { parseVariables, parseCorrectValueType } from '@/features/variables'

export const executeSetVariable = (
  block: SetVariableBlock,
  { sniper: { variables }, updateVariableValue, updateVariables }: LogicState
): EdgeId | undefined => {
  if (!block.options?.variableId) return block.outgoingEdgeId
  if (block.options.type !== undefined && block.options.type !== 'Custom')
    return block.outgoingEdgeId
  const evaluatedExpression = block.options.expressionToEvaluate
    ? evaluateSetVariableExpression(variables)(
        block.options.expressionToEvaluate
      )
    : undefined
  const existingVariable = variables.find(byId(block.options.variableId))
  if (!existingVariable) return block.outgoingEdgeId
  updateVariableValue(existingVariable.id, evaluatedExpression)
  updateVariables([{ ...existingVariable, value: evaluatedExpression }])
  return block.outgoingEdgeId
}

const evaluateSetVariableExpression =
  (variables: Variable[]) =>
  (str: string): unknown => {
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
