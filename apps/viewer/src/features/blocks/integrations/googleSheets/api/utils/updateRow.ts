import { SessionState, GoogleSheetsUpdateRowOptions } from 'models'
import { saveErrorLog, saveSuccessLog } from '@/features/logs/api'
import { getAuthenticatedGoogleDoc, parseCellValues } from './helpers'
import { TRPCError } from '@trpc/server'
import { parseVariables } from '@/features/variables'
import { ExecuteIntegrationResponse } from '@/features/chat'

export const updateRow = async (
  { result, typebot: { variables } }: SessionState,
  {
    outgoingEdgeId,
    options,
  }: { outgoingEdgeId?: string; options: GoogleSheetsUpdateRowOptions }
): Promise<ExecuteIntegrationResponse> => {
  const { sheetId, referenceCell } = options
  if (!options.cellsToUpsert || !sheetId || !referenceCell)
    return { outgoingEdgeId }

  const doc = await getAuthenticatedGoogleDoc({
    credentialsId: options.credentialsId,
    spreadsheetId: options.spreadsheetId,
  })

  const parsedReferenceCell = {
    column: referenceCell.column,
    value: parseVariables(variables)(referenceCell.value),
  }
  const parsedValues = parseCellValues(variables)(options.cellsToUpsert)

  try {
    await doc.loadInfo()
    const sheet = doc.sheetsById[sheetId]
    const rows = await sheet.getRows()
    const updatingRowIndex = rows.findIndex(
      (row) =>
        row[parsedReferenceCell.column as string] === parsedReferenceCell.value
    )
    if (updatingRowIndex === -1) {
      new TRPCError({
        code: 'NOT_FOUND',
        message: "Couldn't find row to update",
      })
    }
    for (const key in parsedValues) {
      rows[updatingRowIndex][key] = parsedValues[key]
    }
    await rows[updatingRowIndex].save()
    result &&
      (await saveSuccessLog({
        resultId: result.id,
        message: 'Succesfully updated row',
      }))
  } catch (err) {
    result &&
      (await saveErrorLog({
        resultId: result.id,
        message: "Couldn't fetch spreadsheet data",
        details: err,
      }))
  }
  return { outgoingEdgeId }
}
