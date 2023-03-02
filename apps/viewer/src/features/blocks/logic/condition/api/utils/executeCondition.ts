import { ExecuteLogicResponse } from '@/features/chat'
import { parseVariables } from '@/features/variables'
import {
  Comparison,
  ComparisonOperators,
  ConditionBlock,
  LogicalOperator,
  SessionState,
  Variable,
} from 'models'
import { isNotDefined, isDefined } from 'utils'

export const executeCondition = (
  { typebot: { variables } }: SessionState,
  block: ConditionBlock
): ExecuteLogicResponse => {
  const passedCondition = block.items.find((item) => {
    const { content } = item
    const isConditionPassed =
      content.logicalOperator === LogicalOperator.AND
        ? content.comparisons.every(executeComparison(variables))
        : content.comparisons.some(executeComparison(variables))
    return isConditionPassed
  })
  return {
    outgoingEdgeId: passedCondition
      ? passedCondition.outgoingEdgeId
      : block.outgoingEdgeId,
  }
}

const executeComparison =
  (variables: Variable[]) => (comparison: Comparison) => {
    if (!comparison?.variableId) return false
    const inputValue =
      variables.find((v) => v.id === comparison.variableId)?.value ?? ''
    const value = parseVariables(variables)(comparison.value)
    if (isNotDefined(value)) return false
    switch (comparison.comparisonOperator) {
      case ComparisonOperators.CONTAINS: {
        const normalizeString = (value: string) => value.toLowerCase().trim()
        const contains = (inputValue: string) =>
          normalizeString(inputValue).includes(normalizeString(value))
        if (typeof inputValue === 'string') return contains(inputValue)
        return inputValue.some(contains)
      }
      case ComparisonOperators.EQUAL: {
        return inputValue === value
      }
      case ComparisonOperators.NOT_EQUAL: {
        return inputValue !== value
      }
      case ComparisonOperators.GREATER: {
        if (typeof inputValue !== 'string') return false
        return parseFloat(inputValue) > parseFloat(value)
      }
      case ComparisonOperators.LESS: {
        if (typeof inputValue !== 'string') return false
        return parseFloat(inputValue) < parseFloat(value)
      }
      case ComparisonOperators.IS_SET: {
        return isDefined(inputValue) && inputValue.length > 0
      }
    }
  }
