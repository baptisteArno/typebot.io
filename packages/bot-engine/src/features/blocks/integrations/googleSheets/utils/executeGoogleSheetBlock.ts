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
} from 'models'
import { stringify } from 'qs'
import { sendRequest, byId } from 'utils'

export const executeGoogleSheetBlock = async (
  block: GoogleSheetsBlock,
  context: IntegrationState
) => {
  if (!('action' in block.options)) return block.outgoingEdgeId
  switch (block.options.action) {
    case GoogleSheetsAction.INSERT_ROW:
      await insertRowInGoogleSheets(block.options, context)
      break
    case GoogleSheetsAction.UPDATE_ROW:
      await updateRowInGoogleSheets(block.options, context)
      break
    case GoogleSheetsAction.GET:
      await getRowFromGoogleSheets(block.options, context)
      break
  }
  return block.outgoingEdgeId
}

const insertRowInGoogleSheets = async (
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
  const params = stringify({ resultId })
  const { error } = await sendRequest({
    url: `${apiHost}/api/integrations/google-sheets/spreadsheets/${options.spreadsheetId}/sheets/${options.sheetId}?${params}`,
    method: 'POST',
    body: {
      credentialsId: options.credentialsId,
      values: parseCellValues(options.cellsToInsert, variables),
    },
  })
  onNewLog(
    parseLog(
      error,
      'Succesfully inserted a row in the sheet',
      'Failed to insert a row in the sheet'
    )
  )
}

const updateRowInGoogleSheets = async (
  options: GoogleSheetsUpdateRowOptions,
  { variables, apiHost, onNewLog, resultId }: IntegrationState
) => {
  if (!options.cellsToUpsert || !options.referenceCell) return
  const params = stringify({ resultId })
  const { error } = await sendRequest({
    url: `${apiHost}/api/integrations/google-sheets/spreadsheets/${options.spreadsheetId}/sheets/${options.sheetId}?${params}`,
    method: 'PATCH',
    body: {
      credentialsId: options.credentialsId,
      values: parseCellValues(options.cellsToUpsert, variables),
      referenceCell: {
        column: options.referenceCell.column,
        value: parseVariables(variables)(options.referenceCell.value ?? ''),
      },
    },
  })
  onNewLog(
    parseLog(
      error,
      'Succesfully updated a row in the sheet',
      'Failed to update a row in the sheet'
    )
  )
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
  if (!options.referenceCell || !options.cellsToExtract) return
  const queryParams = stringify(
    {
      credentialsId: options.credentialsId,
      referenceCell: {
        column: options.referenceCell.column,
        value: parseVariables(variables)(options.referenceCell.value ?? ''),
      },
      columns: options.cellsToExtract.map((cell) => cell.column),
      resultId,
    },
    { indices: false }
  )
  const { data, error } = await sendRequest<{ [key: string]: string }>({
    url: `${apiHost}/api/integrations/google-sheets/spreadsheets/${options.spreadsheetId}/sheets/${options.sheetId}?${queryParams}`,
    method: 'GET',
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
      const value = data[cell.column ?? ''] ?? null
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
