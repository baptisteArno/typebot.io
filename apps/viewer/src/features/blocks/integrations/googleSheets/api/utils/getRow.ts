import {
  SessionState,
  GoogleSheetsGetOptions,
  VariableWithValue,
  ComparisonOperators,
  LogicalOperator,
} from 'models'
import { saveErrorLog } from '@/features/logs/api'
import { getAuthenticatedGoogleDoc } from './helpers'
import { updateVariables } from '@/features/variables'
import { isNotEmpty, byId, isDefined } from 'utils'
import { ExecuteIntegrationResponse } from '@/features/chat'
import type { GoogleSpreadsheetRow } from 'google-spreadsheet'

export const getRow = async (
  state: SessionState,
  {
    outgoingEdgeId,
    options,
  }: { outgoingEdgeId?: string; options: GoogleSheetsGetOptions }
): Promise<ExecuteIntegrationResponse> => {
  const { sheetId, cellsToExtract, referenceCell, filter } = options
  if (!cellsToExtract || !sheetId || !referenceCell) return { outgoingEdgeId }

  const variables = state.typebot.variables
  const resultId = state.result?.id

  const doc = await getAuthenticatedGoogleDoc({
    credentialsId: options.credentialsId,
    spreadsheetId: options.spreadsheetId,
  })

  try {
    await doc.loadInfo()
    const sheet = doc.sheetsById[sheetId]
    const rows = await sheet.getRows()
    const filteredRows = rows.filter((row) =>
      referenceCell
        ? row[referenceCell.column as string] === referenceCell.value
        : matchFilter(row, filter)
    )
    if (filteredRows.length === 0) {
      await saveErrorLog({
        resultId,
        message: "Couldn't find reference cell",
      })
      return { outgoingEdgeId }
    }
    const randomIndex = Math.floor(Math.random() * filteredRows.length)
    const extractingColumns = cellsToExtract
      .map((cell) => cell.column)
      .filter(isNotEmpty)
    const selectedRow = filteredRows
      .map((row) =>
        extractingColumns.reduce<{ [key: string]: string }>(
          (obj, column) => ({ ...obj, [column]: row[column] }),
          {}
        )
      )
      .at(randomIndex)
    if (!selectedRow) return { outgoingEdgeId }

    const newVariables = options.cellsToExtract.reduce<VariableWithValue[]>(
      (newVariables, cell) => {
        const existingVariable = variables.find(byId(cell.variableId))
        const value = selectedRow[cell.column ?? ''] ?? null
        if (!existingVariable) return newVariables
        return [
          ...newVariables,
          {
            ...existingVariable,
            value,
          },
        ]
      },
      []
    )
    const newSessionState = await updateVariables(state)(newVariables)
    return {
      outgoingEdgeId,
      newSessionState,
    }
  } catch (err) {
    await saveErrorLog({
      resultId,
      message: "Couldn't fetch spreadsheet data",
      details: err,
    })
  }
  return { outgoingEdgeId }
}

const matchFilter = (
  row: GoogleSpreadsheetRow,
  filter: GoogleSheetsGetOptions['filter']
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
) => {
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
  }
}
