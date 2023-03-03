import { SessionState, GoogleSheetsUpdateRowOptions, ReplyLog } from 'models'
import { saveErrorLog, saveSuccessLog } from '@/features/logs/api'
import { getAuthenticatedGoogleDoc, parseCellValues } from './helpers'
import { TRPCError } from '@trpc/server'
import { deepParseVariable } from '@/features/variables'
import { ExecuteIntegrationResponse } from '@/features/chat'

export const updateRow = async (
  { result, typebot: { variables } }: SessionState,
  {
    outgoingEdgeId,
    options,
  }: { outgoingEdgeId?: string; options: GoogleSheetsUpdateRowOptions }
): Promise<ExecuteIntegrationResponse> => {
  const { sheetId, referenceCell } = deepParseVariable(variables)(options)
  if (!options.cellsToUpsert || !sheetId || !referenceCell)
    return { outgoingEdgeId }

  let log: ReplyLog | undefined

  const doc = await getAuthenticatedGoogleDoc({
    credentialsId: options.credentialsId,
    spreadsheetId: options.spreadsheetId,
  })

  const parsedValues = parseCellValues(variables)(options.cellsToUpsert)

  try {
    await doc.loadInfo()
    const sheet = doc.sheetsById[sheetId]
    const rows = await sheet.getRows()
    const updatingRowIndex = rows.findIndex(
      (row) => row[referenceCell.column as string] === referenceCell.value
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
    log = log = {
      status: 'success',
      description: `Succesfully updated row in ${doc.title} > ${sheet.title}`,
    }
    result &&
      (await saveSuccessLog({
        resultId: result.id,
        message: log.description,
      }))
  } catch (err) {
    log = {
      status: 'error',
      description: `An error occured while updating the row`,
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
