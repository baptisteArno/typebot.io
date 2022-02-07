import {
  LogicStep,
  LogicStepType,
  LogicalOperator,
  ConditionStep,
  Variable,
  ComparisonOperators,
  SetVariableStep,
  RedirectStep,
  Comparison,
} from 'models'
import { isDefined, isNotDefined } from 'utils'
import { sanitizeUrl } from './utils'
import { isMathFormula, evaluateExpression, parseVariables } from './variable'

type EdgeId = string

export const executeLogic = (
  step: LogicStep,
  variables: Variable[],
  updateVariableValue: (variableId: string, expression: string) => void
): EdgeId | undefined => {
  switch (step.type) {
    case LogicStepType.SET_VARIABLE:
      return executeSetVariable(step, variables, updateVariableValue)
    case LogicStepType.CONDITION:
      return executeCondition(step, variables)
    case LogicStepType.REDIRECT:
      return executeRedirect(step, variables)
  }
}

const executeSetVariable = (
  step: SetVariableStep,
  variables: Variable[],
  updateVariableValue: (variableId: string, expression: string) => void
): EdgeId | undefined => {
  if (!step.options?.variableId || !step.options.expressionToEvaluate)
    return step.outgoingEdgeId
  const expression = step.options.expressionToEvaluate
  const evaluatedExpression = isMathFormula(expression)
    ? evaluateExpression(parseVariables(variables)(expression))
    : expression
  updateVariableValue(step.options.variableId, evaluatedExpression)
  return step.outgoingEdgeId
}

const executeCondition = (
  step: ConditionStep,
  variables: Variable[]
): EdgeId | undefined => {
  const { content } = step.items[0]
  const isConditionPassed =
    content.logicalOperator === LogicalOperator.AND
      ? content.comparisons.every(executeComparison(variables))
      : content.comparisons.some(executeComparison(variables))
  return isConditionPassed ? step.items[0].outgoingEdgeId : step.outgoingEdgeId
}

const executeComparison =
  (variables: Variable[]) => (comparison: Comparison) => {
    if (!comparison?.variableId) return false
    const inputValue =
      variables.find((v) => v.id === comparison.variableId)?.value ?? ''
    const { value } = comparison
    if (isNotDefined(value)) return false
    switch (comparison.comparisonOperator) {
      case ComparisonOperators.CONTAINS: {
        return inputValue.includes(value)
      }
      case ComparisonOperators.EQUAL: {
        return inputValue === value
      }
      case ComparisonOperators.NOT_EQUAL: {
        return inputValue !== value
      }
      case ComparisonOperators.GREATER: {
        return parseFloat(inputValue) >= parseFloat(value)
      }
      case ComparisonOperators.LESS: {
        return parseFloat(inputValue) <= parseFloat(value)
      }
      case ComparisonOperators.IS_SET: {
        return isDefined(inputValue) && inputValue.length > 0
      }
    }
  }

const executeRedirect = (
  step: RedirectStep,
  variables: Variable[]
): EdgeId | undefined => {
  if (!step.options?.url) return step.outgoingEdgeId
  window.open(
    sanitizeUrl(parseVariables(variables)(step.options?.url)),
    step.options.isNewTab ? '_blank' : '_self'
  )
  return step.outgoingEdgeId
}
