import {
  SessionState,
  GoogleSheetsInsertRowOptions,
  ReplyLog,
} from '@typebot.io/schemas'
import { parseCellValues } from './helpers/parseCellValues'
import { getAuthenticatedGoogleDoc } from './helpers/getAuthenticatedGoogleDoc'
import { ExecuteIntegrationResponse } from '@/features/chat/types'
import { saveErrorLog } from '@/features/logs/saveErrorLog'
import { saveSuccessLog } from '@/features/logs/saveSuccessLog'

export const insertRow = async (
  { result, typebot: { variables } }: SessionState,
  {
    outgoingEdgeId,
    options,
  }: { outgoingEdgeId?: string; options: GoogleSheetsInsertRowOptions }
): Promise<ExecuteIntegrationResponse> => {
  if (!options.cellsToInsert || !options.sheetId) return { outgoingEdgeId }

  let log: ReplyLog | undefined

  const doc = await getAuthenticatedGoogleDoc({
    credentialsId: options.credentialsId,
    spreadsheetId: options.spreadsheetId,
  })

  const parsedValues = parseCellValues(variables)(options.cellsToInsert)

  try {
    await doc.loadInfo()
    const sheet = doc.sheetsById[options.sheetId]
    await sheet.addRow(parsedValues)
    log = {
      status: 'success',
      description: `Succesfully inserted row in ${doc.title} > ${sheet.title}`,
    }
    result &&
      (await saveSuccessLog({
        resultId: result.id,
        message: log?.description,
      }))
  } catch (err) {
    log = {
      status: 'error',
      description: `An error occured while inserting the row`,
      details: err,
    }
    result &&
      (await saveErrorLog({
        resultId: result.id,
        message: log.description,
        details: err,
      }))
  }
  return { outgoingEdgeId, logs: log ? [log] : undefined }
}
