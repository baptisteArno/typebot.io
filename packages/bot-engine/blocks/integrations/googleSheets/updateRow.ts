import {
  SessionState,
  GoogleSheetsUpdateRowOptions,
  ChatLog,
} from '@sniper.io/schemas'
import { parseCellValues } from './helpers/parseCellValues'
import { getAuthenticatedGoogleDoc } from './helpers/getAuthenticatedGoogleDoc'
import { ExecuteIntegrationResponse } from '../../../types'
import { matchFilter } from './helpers/matchFilter'
import { deepParseVariables } from '@sniper.io/variables/deepParseVariables'

export const updateRow = async (
  state: SessionState,
  {
    outgoingEdgeId,
    options,
  }: { outgoingEdgeId?: string; options: GoogleSheetsUpdateRowOptions }
): Promise<ExecuteIntegrationResponse> => {
  const { variables } = state.snipersQueue[0].sniper
  const { sheetId, filter, ...parsedOptions } = deepParseVariables(variables, {
    removeEmptyStrings: true,
  })(options)

  const referenceCell =
    'referenceCell' in parsedOptions && parsedOptions.referenceCell
      ? parsedOptions.referenceCell
      : null

  if (!options.cellsToUpsert || !sheetId || (!referenceCell && !filter))
    return { outgoingEdgeId }

  const logs: ChatLog[] = []

  const doc = await getAuthenticatedGoogleDoc({
    credentialsId: options.credentialsId,
    spreadsheetId: options.spreadsheetId,
  })

  const parsedValues = parseCellValues(variables)(options.cellsToUpsert)

  await doc.loadInfo()
  const sheet = doc.sheetsById[Number(sheetId)]
  const rows = await sheet.getRows()
  const filteredRows = rows.filter((row) =>
    referenceCell
      ? row.get(referenceCell.column as string) === referenceCell.value
      : matchFilter(row, filter as NonNullable<typeof filter>)
  )
  if (filteredRows.length === 0) {
    logs.push({
      status: 'info',
      description: `Could not find any row that matches the filter`,
      details: filter,
    })
    return { outgoingEdgeId, logs }
  }

  try {
    for (const filteredRow of filteredRows) {
      const rowIndex = filteredRow.rowNumber - 2 // -1 for 1-indexing, -1 for header row
      for (const key in parsedValues) {
        rows[rowIndex].set(key, parsedValues[key])
      }
      await rows[rowIndex].save()
    }

    logs.push({
      status: 'success',
      description: `Succesfully updated matching rows`,
    })
  } catch (err) {
    console.log(err)
    logs.push({
      status: 'error',
      description: `An error occured while updating the row`,
      details: err,
    })
  }
  return { outgoingEdgeId, logs }
}
