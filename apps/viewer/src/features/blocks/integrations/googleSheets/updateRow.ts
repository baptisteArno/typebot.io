import {
  SessionState,
  GoogleSheetsUpdateRowOptions,
  ReplyLog,
} from '@typebot.io/schemas'
import { parseCellValues } from './helpers/parseCellValues'
import { getAuthenticatedGoogleDoc } from './helpers/getAuthenticatedGoogleDoc'
import { deepParseVariables } from '@/features/variables/deepParseVariable'
import { ExecuteIntegrationResponse } from '@/features/chat/types'
import { saveErrorLog } from '@/features/logs/saveErrorLog'
import { saveSuccessLog } from '@/features/logs/saveSuccessLog'
import { TRPCError } from '@trpc/server'
import { matchFilter } from './helpers/matchFilter'

export const updateRow = async (
  { result, typebot: { variables } }: SessionState,
  {
    outgoingEdgeId,
    options,
  }: { outgoingEdgeId?: string; options: GoogleSheetsUpdateRowOptions }
): Promise<ExecuteIntegrationResponse> => {
  const { sheetId, referenceCell, filter } =
    deepParseVariables(variables)(options)
  if (!options.cellsToUpsert || !sheetId || (!referenceCell && !filter))
    return { outgoingEdgeId }

  let log: ReplyLog | undefined

  const doc = await getAuthenticatedGoogleDoc({
    credentialsId: options.credentialsId,
    spreadsheetId: options.spreadsheetId,
  })

  const parsedValues = parseCellValues(variables)(options.cellsToUpsert)

  await doc.loadInfo()
  const sheet = doc.sheetsById[sheetId]
  const rows = await sheet.getRows()
  const filteredRows = rows.filter((row) =>
    referenceCell
      ? row[referenceCell.column as string] === referenceCell.value
      : matchFilter(row, filter as NonNullable<typeof filter>)
  )
  if (filteredRows.length === 0) {
    log = {
      status: 'error',
      description: `Could not find any row that matches the filter`,
      details: JSON.stringify(filter, null, 2),
    }
    result &&
      (await saveErrorLog({
        resultId: result.id,
        message: log.description,
        details: log.details,
      }))
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `Could not find any row that matches the filter`,
    })
  }

  try {
    for (const filteredRow of filteredRows) {
      const rowIndex = rows.findIndex((row) => row.id === filteredRow.id)
      for (const key in parsedValues) {
        rows[rowIndex][key] = parsedValues[key]
      }
      await rows[rowIndex].save()
    }

    log = log = {
      status: 'success',
      description: `Succesfully updated matching rows`,
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
