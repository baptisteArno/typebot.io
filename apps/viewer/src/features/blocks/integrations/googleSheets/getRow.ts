import {
  SessionState,
  GoogleSheetsGetOptions,
  VariableWithValue,
  ReplyLog,
} from '@typebot.io/schemas'
import { isNotEmpty, byId } from '@typebot.io/lib'
import { getAuthenticatedGoogleDoc } from './helpers/getAuthenticatedGoogleDoc'
import { ExecuteIntegrationResponse } from '@/features/chat/types'
import { saveErrorLog } from '@/features/logs/saveErrorLog'
import { updateVariables } from '@/features/variables/updateVariables'
import { deepParseVariables } from '@/features/variables/deepParseVariable'
import { matchFilter } from './helpers/matchFilter'

export const getRow = async (
  state: SessionState,
  {
    outgoingEdgeId,
    options,
  }: { outgoingEdgeId?: string; options: GoogleSheetsGetOptions }
): Promise<ExecuteIntegrationResponse> => {
  const { sheetId, cellsToExtract, referenceCell, filter } = deepParseVariables(
    state.typebot.variables
  )(options)
  if (!sheetId) return { outgoingEdgeId }

  let log: ReplyLog | undefined

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
    const filteredRows = getTotalRows(
      options.totalRowsToExtract,
      rows.filter((row) =>
        referenceCell
          ? row[referenceCell.column as string] === referenceCell.value
          : matchFilter(row, filter as NonNullable<typeof filter>)
      )
    )
    if (filteredRows.length === 0) {
      log = {
        status: 'error',
        description: `Couldn't find any rows matching the filter`,
      }
      await saveErrorLog({
        resultId,
        message: log.description,
      })
      return { outgoingEdgeId, logs: log ? [log] : undefined }
    }
    const extractingColumns = cellsToExtract
      .map((cell) => cell.column)
      .filter(isNotEmpty)
    const selectedRows = filteredRows.map((row) =>
      extractingColumns.reduce<{ [key: string]: string }>(
        (obj, column) => ({ ...obj, [column]: row[column] }),
        {}
      )
    )
    if (!selectedRows) return { outgoingEdgeId }

    const newVariables = options.cellsToExtract.reduce<VariableWithValue[]>(
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
    const newSessionState = await updateVariables(state)(newVariables)
    return {
      outgoingEdgeId,
      newSessionState,
    }
  } catch (err) {
    log = {
      status: 'error',
      description: `An error occurred while fetching the spreadsheet data`,
      details: err,
    }
    await saveErrorLog({
      resultId,
      message: log.description,
      details: err,
    })
  }
  return { outgoingEdgeId, logs: log ? [log] : undefined }
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
