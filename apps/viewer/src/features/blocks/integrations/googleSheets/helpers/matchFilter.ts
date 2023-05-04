import { isDefined } from '@typebot.io/lib'
import {
  GoogleSheetsGetOptions,
  LogicalOperator,
  ComparisonOperators,
} from '@typebot.io/schemas'
import { GoogleSpreadsheetRow } from 'google-spreadsheet'

export const matchFilter = (
  row: GoogleSpreadsheetRow,
  filter: NonNullable<GoogleSheetsGetOptions['filter']>
) => {
  return filter.logicalOperator === LogicalOperator.AND
    ? filter.comparisons.every(
        (comparison) =>
          comparison.column &&
          matchComparison(
            row[comparison.column],
            comparison.comparisonOperator,
            comparison.value
          )
      )
    : filter.comparisons.some(
        (comparison) =>
          comparison.column &&
          matchComparison(
            row[comparison.column],
            comparison.comparisonOperator,
            comparison.value
          )
      )
}

const matchComparison = (
  inputValue?: string,
  comparisonOperator?: ComparisonOperators,
  value?: string
): boolean => {
  if (!inputValue || !comparisonOperator || !value) return false
  switch (comparisonOperator) {
    case ComparisonOperators.CONTAINS: {
      return inputValue.toLowerCase().includes(value.toLowerCase())
    }
    case ComparisonOperators.EQUAL: {
      return inputValue === value
    }
    case ComparisonOperators.NOT_EQUAL: {
      return inputValue !== value
    }
    case ComparisonOperators.GREATER: {
      return parseFloat(inputValue) > parseFloat(value)
    }
    case ComparisonOperators.LESS: {
      return parseFloat(inputValue) < parseFloat(value)
    }
    case ComparisonOperators.IS_SET: {
      return isDefined(inputValue) && inputValue.length > 0
    }
    case ComparisonOperators.IS_EMPTY: {
      return !isDefined(inputValue) || inputValue.length === 0
    }
    case ComparisonOperators.STARTS_WITH: {
      return inputValue.toLowerCase().startsWith(value.toLowerCase())
    }
    case ComparisonOperators.ENDS_WITH: {
      return inputValue.toLowerCase().endsWith(value.toLowerCase())
    }
    case ComparisonOperators.NOT_CONTAINS: {
      return !inputValue.toLowerCase().includes(value.toLowerCase())
    }
  }
}
