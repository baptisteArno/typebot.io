import {
  SessionState,
  GoogleSheetsUpdateRowOptions,
  ChatLog,
} from '@typebot.io/schemas'
import { parseNewCellValuesObject } from './helpers/parseNewCellValuesObject'
import { getAuthenticatedGoogleDoc } from './helpers/getAuthenticatedGoogleDoc'
import { ExecuteIntegrationResponse } from '../../../types'
import { matchFilter } from './helpers/matchFilter'
import { deepParseVariables } from '@typebot.io/variables/deepParseVariables'

export const updateRow = async (
  state: SessionState,
  {
    outgoingEdgeId,
    options,
  }: { outgoingEdgeId?: string; options: GoogleSheetsUpdateRowOptions }
): Promise<ExecuteIntegrationResponse> => {
  const { variables } = state.typebotsQueue[0].typebot
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

  const parsedValues = parseNewCellValuesObject(variables)(
    options.cellsToUpsert,
    sheet.headerValues
  )

  try {
    for (const filteredRow of filteredRows) {
      const cellsRange = filteredRow.a1Range.split('!').pop()
      await sheet.loadCells(cellsRange)
      const rowIndex = filteredRow.rowNumber - 1
      for (const key in parsedValues) {
        const cellToUpdate = sheet.getCell(
          rowIndex,
          parsedValues[key].columnIndex
        )
        cellToUpdate.value = parsedValues[key].value
      }
      await sheet.saveUpdatedCells()
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
