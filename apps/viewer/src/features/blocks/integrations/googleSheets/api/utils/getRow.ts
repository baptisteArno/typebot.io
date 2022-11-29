import { SessionState, GoogleSheetsGetOptions, VariableWithValue } from 'models'
import { saveErrorLog, saveSuccessLog } from '@/features/logs/api'
import { getAuthenticatedGoogleDoc } from './helpers'
import { parseVariables, updateVariables } from '@/features/variables'
import { isNotEmpty, byId } from 'utils'
import { ExecuteIntegrationResponse } from '@/features/chat'

export const getRow = async (
  state: SessionState,
  {
    outgoingEdgeId,
    options,
  }: { outgoingEdgeId?: string; options: GoogleSheetsGetOptions }
): Promise<ExecuteIntegrationResponse> => {
  const { sheetId, cellsToExtract, referenceCell } = options
  if (!cellsToExtract || !sheetId || !referenceCell) return { outgoingEdgeId }

  const variables = state.typebot.variables
  const resultId = state.result.id

  const doc = await getAuthenticatedGoogleDoc({
    credentialsId: options.credentialsId,
    spreadsheetId: options.spreadsheetId,
  })

  const parsedReferenceCell = {
    column: referenceCell.column,
    value: parseVariables(variables)(referenceCell.value),
  }

  const extractingColumns = cellsToExtract
    .map((cell) => cell.column)
    .filter(isNotEmpty)

  try {
    await doc.loadInfo()
    const sheet = doc.sheetsById[sheetId]
    const rows = await sheet.getRows()
    const row = rows.find(
      (row) =>
        row[parsedReferenceCell.column as string] === parsedReferenceCell.value
    )
    if (!row) {
      await saveErrorLog({
        resultId,
        message: "Couldn't find reference cell",
      })
      return { outgoingEdgeId }
    }
    const data: { [key: string]: string } = {
      ...extractingColumns.reduce(
        (obj, column) => ({ ...obj, [column]: row[column] }),
        {}
      ),
    }
    await saveSuccessLog({
      resultId,
      message: 'Succesfully fetched spreadsheet data',
    })

    const newVariables = options.cellsToExtract.reduce<VariableWithValue[]>(
      (newVariables, cell) => {
        const existingVariable = variables.find(byId(cell.variableId))
        const value = data[cell.column ?? ''] ?? null
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
