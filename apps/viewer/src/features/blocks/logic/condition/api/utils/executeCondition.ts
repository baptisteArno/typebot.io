import { ExecuteLogicResponse } from '@/features/chat'
import { findUniqueVariableValue, parseVariables } from '@/features/variables'
import {
  Comparison,
  ComparisonOperators,
  ConditionBlock,
  LogicalOperator,
  SessionState,
  Variable,
} from '@typebot.io/schemas'
import { isNotDefined, isDefined } from '@typebot.io/lib'

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
    const value =
      findUniqueVariableValue(variables)(comparison.value) ??
      parseVariables(variables)(comparison.value)
    if (isNotDefined(value)) return false
    switch (comparison.comparisonOperator) {
      case ComparisonOperators.CONTAINS: {
        const contains = (a: string, b: string) => {
          if (b === '') return false
          return a.toLowerCase().trim().includes(b.toLowerCase().trim())
        }
        return compare(contains, inputValue, value)
      }
      case ComparisonOperators.EQUAL: {
        return compare((a, b) => a === b, inputValue, value)
      }
      case ComparisonOperators.NOT_EQUAL: {
        return compare((a, b) => a !== b, inputValue, value)
      }
      case ComparisonOperators.GREATER: {
        return compare(
          (a, b) => parseFloat(a) > parseFloat(b),
          inputValue,
          value
        )
      }
      case ComparisonOperators.LESS: {
        return compare(
          (a, b) => parseFloat(a) < parseFloat(b),
          inputValue,
          value
        )
      }
      case ComparisonOperators.IS_SET: {
        return isDefined(inputValue) && inputValue.length > 0
      }
    }
  }

const compare = (
  func: (a: string, b: string) => boolean,
  a: string | string[],
  b: string | string[]
): boolean => {
  if (typeof a === 'string') {
    if (typeof b === 'string') return func(a, b)
    return b.some((b) => func(a, b))
  }
  if (typeof b === 'string') return a.some((a) => func(a, b))
  return a.some((a) => b.some((b) => func(a, b)))
}
