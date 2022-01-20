import {
  LogicStep,
  LogicStepType,
  LogicalOperator,
  ConditionStep,
  Table,
  Variable,
  ComparisonOperators,
  SetVariableStep,
  RedirectStep,
} from 'models'
import { isDefined } from 'utils'
import { sanitizeUrl } from './utils'
import { isMathFormula, evaluateExpression, parseVariables } from './variable'

type EdgeId = string
export const executeLogic = (
  step: LogicStep,
  variables: Table<Variable>,
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
  variables: Table<Variable>,
  updateVariableValue: (variableId: string, expression: string) => void
): EdgeId | undefined => {
  if (!step.options?.variableId || !step.options.expressionToEvaluate)
    return step.edgeId
  const expression = step.options.expressionToEvaluate
  const evaluatedExpression = isMathFormula(expression)
    ? evaluateExpression(parseVariables({ text: expression, variables }))
    : expression
  updateVariableValue(step.options.variableId, evaluatedExpression)
  return step.edgeId
}

const executeCondition = (
  step: ConditionStep,
  variables: Table<Variable>
): EdgeId | undefined => {
  const isConditionPassed =
    step.options?.logicalOperator === LogicalOperator.AND
      ? step.options?.comparisons.allIds.every(
          executeComparison(step, variables)
        )
      : step.options?.comparisons.allIds.some(
          executeComparison(step, variables)
        )
  return isConditionPassed ? step.trueEdgeId : step.falseEdgeId
}

const executeComparison =
  (step: ConditionStep, variables: Table<Variable>) =>
  (comparisonId: string) => {
    const comparison = step.options?.comparisons.byId[comparisonId]
    if (!comparison?.variableId) return false
    const inputValue = variables.byId[comparison.variableId].value ?? ''
    const { value } = comparison
    if (!isDefined(value)) return false
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
  variables: Table<Variable>
): EdgeId | undefined => {
  if (!step.options?.url) return step.edgeId
  window.open(
    sanitizeUrl(parseVariables({ text: step.options?.url, variables })),
    step.options.isNewTab ? '_blank' : '_self'
  )
  return step.edgeId
}
