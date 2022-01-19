import {
  LogicStep,
  Target,
  LogicStepType,
  LogicalOperator,
  ConditionStep,
  Table,
  Variable,
  ComparisonOperators,
} from 'models'
import { isDefined } from 'utils'
import { isMathFormula, evaluateExpression, parseVariables } from './variable'

export const executeLogic = (
  step: LogicStep,
  variables: Table<Variable>,
  updateVariableValue: (variableId: string, expression: string) => void
): Target | undefined => {
  switch (step.type) {
    case LogicStepType.SET_VARIABLE: {
      if (!step.options?.variableId || !step.options.expressionToEvaluate)
        return
      const expression = step.options.expressionToEvaluate
      const evaluatedExpression = isMathFormula(expression)
        ? evaluateExpression(parseVariables({ text: expression, variables }))
        : expression
      updateVariableValue(step.options.variableId, evaluatedExpression)
      return
    }
    case LogicStepType.CONDITION: {
      const isConditionPassed =
        step.options?.logicalOperator === LogicalOperator.AND
          ? step.options?.comparisons.allIds.every(
              executeComparison(step, variables)
            )
          : step.options?.comparisons.allIds.some(
              executeComparison(step, variables)
            )
      return isConditionPassed ? step.trueTarget : step.falseTarget
    }
  }
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
