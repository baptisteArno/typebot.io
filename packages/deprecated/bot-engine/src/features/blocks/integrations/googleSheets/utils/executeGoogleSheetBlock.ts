import { parseVariables } from '@/features/variables'
import { IntegrationState } from '@/types'
import { parseLog } from '@/utils/helpers'
import {
  GoogleSheetsBlock,
  GoogleSheetsAction,
  GoogleSheetsInsertRowOptions,
  GoogleSheetsUpdateRowOptions,
  GoogleSheetsGetOptions,
  VariableWithValue,
  Cell,
  Variable,
} from '@typebot.io/schemas'
import { sendRequest, byId } from '@typebot.io/lib'

export const executeGoogleSheetBlock = async (
  block: GoogleSheetsBlock,
  context: IntegrationState
) => {
  if (!('action' in block.options)) return block.outgoingEdgeId
  switch (block.options.action) {
    case GoogleSheetsAction.INSERT_ROW:
      insertRowInGoogleSheets(block.options, context)
      break
    case GoogleSheetsAction.UPDATE_ROW:
      updateRowInGoogleSheets(block.options, context)
      break
    case GoogleSheetsAction.GET:
      await getRowFromGoogleSheets(block.options, context)
      break
  }
  return block.outgoingEdgeId
}

const insertRowInGoogleSheets = (
  options: GoogleSheetsInsertRowOptions,
  { variables, apiHost, onNewLog, resultId }: IntegrationState
) => {
  if (!options.cellsToInsert) {
    onNewLog({
      status: 'warning',
      description: 'Cells to insert are undefined',
      details: null,
    })
    return
  }
  sendRequest({
    url: `${apiHost}/api/integrations/google-sheets/spreadsheets/${options.spreadsheetId}/sheets/${options.sheetId}`,
    method: 'POST',
    body: {
      action: GoogleSheetsAction.INSERT_ROW,
      credentialsId: options.credentialsId,
      resultId,
      values: parseCellValues(options.cellsToInsert, variables),
    },
  }).then(({ error }) => {
    onNewLog(
      parseLog(
        error,
        'Succesfully inserted a row in the sheet',
        'Failed to insert a row in the sheet'
      )
    )
  })
}

const updateRowInGoogleSheets = (
  options: GoogleSheetsUpdateRowOptions,
  { variables, apiHost, onNewLog, resultId }: IntegrationState
) => {
  if (!options.cellsToUpsert || !options.referenceCell) return
  sendRequest({
    url: `${apiHost}/api/integrations/google-sheets/spreadsheets/${options.spreadsheetId}/sheets/${options.sheetId}`,
    method: 'POST',
    body: {
      action: GoogleSheetsAction.UPDATE_ROW,
      credentialsId: options.credentialsId,
      values: parseCellValues(options.cellsToUpsert, variables),
      resultId,
      referenceCell: {
        column: options.referenceCell.column,
        value: parseVariables(variables)(options.referenceCell.value ?? ''),
      },
    },
  }).then(({ error }) => {
    onNewLog(
      parseLog(
        error,
        'Succesfully updated a row in the sheet',
        'Failed to update a row in the sheet'
      )
    )
  })
}

const getRowFromGoogleSheets = async (
  options: GoogleSheetsGetOptions,
  {
    variables,
    updateVariableValue,
    updateVariables,
    apiHost,
    onNewLog,
    resultId,
  }: IntegrationState
) => {
  if (!options.cellsToExtract) return
  const { data, error } = await sendRequest<{
    rows: { [key: string]: string }[]
  }>({
    url: `${apiHost}/api/integrations/google-sheets/spreadsheets/${options.spreadsheetId}/sheets/${options.sheetId}`,
    method: 'POST',
    body: {
      action: GoogleSheetsAction.GET,
      credentialsId: options.credentialsId,
      referenceCell: options.referenceCell
        ? {
            column: options.referenceCell.column,
            value: parseVariables(variables)(options.referenceCell.value ?? ''),
          }
        : undefined,
      filter: options.filter
        ? {
            comparisons: options.filter.comparisons.map((comparison) => ({
              ...comparison,
              value: parseVariables(variables)(comparison.value),
            })),
            logicalOperator: options.filter?.logicalOperator ?? 'AND',
          }
        : undefined,
      columns: options.cellsToExtract.map((cell) => cell.column),
      resultId,
    },
  })
  onNewLog(
    parseLog(
      error,
      'Succesfully fetched data from sheet',
      'Failed to fetch data from sheet'
    )
  )
  if (!data) return
  const newVariables = options.cellsToExtract.reduce<VariableWithValue[]>(
    (newVariables, cell) => {
      const existingVariable = variables.find(byId(cell.variableId))
      const rows = data.rows
      const randomRow = rows[Math.floor(Math.random() * rows.length)]
      const value = randomRow[cell.column ?? ''] ?? null
      if (!existingVariable) return newVariables
      updateVariableValue(existingVariable.id, value)
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
  updateVariables(newVariables)
}

const parseCellValues = (
  cells: Cell[],
  variables: Variable[]
): { [key: string]: string } =>
  cells.reduce((row, cell) => {
    return !cell.column || !cell.value
      ? row
      : {
          ...row,
          [cell.column]: parseVariables(variables)(cell.value),
        }
  }, {})
