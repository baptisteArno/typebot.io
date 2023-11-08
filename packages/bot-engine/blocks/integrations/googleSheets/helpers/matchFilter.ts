import { isDefined } from '@typebot.io/lib'
import { GoogleSheetsGetOptions } from '@typebot.io/schemas'
import {
  LogicalOperator,
  ComparisonOperators,
} from '@typebot.io/schemas/features/blocks/logic/condition/constants'
import { GoogleSpreadsheetRow } from 'google-spreadsheet'

export const matchFilter = (
  row: GoogleSpreadsheetRow,
  filter: GoogleSheetsGetOptions['filter']
) => {
  if (!filter) return true
  return filter.logicalOperator === LogicalOperator.AND
    ? filter.comparisons?.every(
        (comparison) =>
          comparison.column &&
          matchComparison(
            row.get(comparison.column),
            comparison.comparisonOperator,
            comparison.value
          )
      )
    : filter.comparisons?.some(
        (comparison) =>
          comparison.column &&
          matchComparison(
            row.get(comparison.column),
            comparison.comparisonOperator,
            comparison.value
          )
      )
}

const matchComparison = (
  inputValue?: string,
  comparisonOperator?: ComparisonOperators,
  value?: string
): boolean | undefined => {
  if (!comparisonOperator) return false
  switch (comparisonOperator) {
    case ComparisonOperators.CONTAINS: {
      if (!inputValue || !value) return false
      return inputValue
        .toLowerCase()
        .trim()
        .normalize()
        .includes(value.toLowerCase().trim().normalize())
    }
    case ComparisonOperators.EQUAL: {
      return inputValue?.normalize() === value?.normalize()
    }
    case ComparisonOperators.NOT_EQUAL: {
      return inputValue?.normalize() !== value?.normalize()
    }
    case ComparisonOperators.GREATER: {
      if (!inputValue || !value) return false
      return parseFloat(inputValue) > parseFloat(value)
    }
    case ComparisonOperators.LESS: {
      if (!inputValue || !value) return false
      return parseFloat(inputValue) < parseFloat(value)
    }
    case ComparisonOperators.IS_SET: {
      return isDefined(inputValue) && inputValue.length > 0
    }
    case ComparisonOperators.IS_EMPTY: {
      return !isDefined(inputValue) || inputValue.length === 0
    }
    case ComparisonOperators.STARTS_WITH: {
      if (!inputValue || !value) return false
      return inputValue
        .toLowerCase()
        .trim()
        .normalize()
        .startsWith(value.toLowerCase().trim().normalize())
    }
    case ComparisonOperators.ENDS_WITH: {
      if (!inputValue || !value) return false
      return inputValue
        .toLowerCase()
        .trim()
        .normalize()
        .endsWith(value.toLowerCase().trim().normalize())
    }
    case ComparisonOperators.NOT_CONTAINS: {
      if (!inputValue || !value) return false
      return !inputValue
        ?.toLowerCase()
        .trim()
        .normalize()
        .includes(value.toLowerCase().trim().normalize())
    }
  }
}
