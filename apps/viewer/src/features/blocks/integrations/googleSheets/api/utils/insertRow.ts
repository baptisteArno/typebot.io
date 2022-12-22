import { SessionState, GoogleSheetsInsertRowOptions } from 'models'
import { saveErrorLog, saveSuccessLog } from '@/features/logs/api'
import { getAuthenticatedGoogleDoc, parseCellValues } from './helpers'
import { ExecuteIntegrationResponse } from '@/features/chat'

export const insertRow = async (
  { result, typebot: { variables } }: SessionState,
  {
    outgoingEdgeId,
    options,
  }: { outgoingEdgeId?: string; options: GoogleSheetsInsertRowOptions }
): Promise<ExecuteIntegrationResponse> => {
  if (!options.cellsToInsert || !options.sheetId) return { outgoingEdgeId }

  const doc = await getAuthenticatedGoogleDoc({
    credentialsId: options.credentialsId,
    spreadsheetId: options.spreadsheetId,
  })

  const parsedValues = parseCellValues(variables)(options.cellsToInsert)

  try {
    await doc.loadInfo()
    const sheet = doc.sheetsById[options.sheetId]
    await sheet.addRow(parsedValues)
    result &&
      (await saveSuccessLog({
        resultId: result.id,
        message: 'Succesfully inserted row',
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
