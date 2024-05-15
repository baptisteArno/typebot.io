import {
  SessionState,
  GoogleSheetsGetOptions,
  VariableWithValue,
  ChatLog,
} from '@typebot.io/schemas'
import { isNotEmpty, byId, isDefined } from '@typebot.io/lib'
import { getAuthenticatedGoogleDoc } from './helpers/getAuthenticatedGoogleDoc'
import { ExecuteIntegrationResponse } from '../../../types'
import { matchFilter } from './helpers/matchFilter'
import { deepParseVariables } from '@typebot.io/variables/deepParseVariables'
import { updateVariablesInSession } from '@typebot.io/variables/updateVariablesInSession'

export const getRow = async (
  state: SessionState,
  {
    blockId,
    outgoingEdgeId,
    options,
  }: {
    blockId: string
    outgoingEdgeId?: string
    options: GoogleSheetsGetOptions
  }
): Promise<ExecuteIntegrationResponse> => {
  const logs: ChatLog[] = []
  const { variables } = state.typebotsQueue[0].typebot
  const { sheetId, cellsToExtract, filter, ...parsedOptions } =
    deepParseVariables(variables, { removeEmptyStrings: true })(options)
  if (!sheetId) return { outgoingEdgeId }

  const doc = await getAuthenticatedGoogleDoc({
    credentialsId: options.credentialsId,
    spreadsheetId: options.spreadsheetId,
  })

  try {
    await doc.loadInfo()
    const sheet = doc.sheetsById[Number(sheetId)]
    const rows = await sheet.getRows()
    const filteredRows = getTotalRows(
      options.totalRowsToExtract,
      rows.filter((row) =>
        'referenceCell' in parsedOptions && parsedOptions.referenceCell
          ? row.get(parsedOptions.referenceCell?.column as string) ===
            parsedOptions.referenceCell?.value
          : matchFilter(row, filter)
      )
    )
    if (filteredRows.length === 0) {
      logs.push({
        status: 'info',
        description: `Couldn't find any rows matching the filter`,
        details: JSON.stringify(filter, null, 2),
      })
      return { outgoingEdgeId, logs }
    }
    const extractingColumns = cellsToExtract
      ?.map((cell) => cell.column)
      .filter(isNotEmpty)
    const selectedRows = filteredRows
      .map((row) =>
        extractingColumns?.reduce<{ [key: string]: string }>(
          (obj, column) => ({ ...obj, [column]: row.get(column) }),
          {}
        )
      )
      .filter(isDefined)
    if (!selectedRows) return { outgoingEdgeId }

    const newVariables = options.cellsToExtract?.reduce<VariableWithValue[]>(
      (newVariables, cell) => {
        const existingVariable = variables.find(byId(cell.variableId))
        const value = selectedRows.map((row) => row[cell.column ?? ''])
        if (!existingVariable) return newVariables
        return [
          ...newVariables,
          {
            ...existingVariable,
            value: value.length === 1 ? value[0] : value,
          },
        ]
      },
      []
    )
    if (!newVariables) return { outgoingEdgeId }
    const { updatedState, newSetVariableHistory } = updateVariablesInSession({
      state,
      newVariables,
      currentBlockId: blockId,
    })
    return {
      outgoingEdgeId,
      newSessionState: updatedState,
      newSetVariableHistory,
    }
  } catch (err) {
    logs.push({
      status: 'error',
      description: `An error occurred while fetching the spreadsheet data`,
      details: err,
    })
  }
  return { outgoingEdgeId, logs }
}

const getTotalRows = <T>(
  totalRowsToExtract: GoogleSheetsGetOptions['totalRowsToExtract'],
  rows: T[]
): T[] => {
  switch (totalRowsToExtract) {
    case 'All':
    case undefined:
      return rows
    case 'First':
      return rows.slice(0, 1)
    case 'Last':
      return rows.slice(-1)
    case 'Random':
      return [rows[Math.floor(Math.random() * rows.length)]]
  }
}
