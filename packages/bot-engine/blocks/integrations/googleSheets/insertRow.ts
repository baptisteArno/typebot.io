import {
  SessionState,
  GoogleSheetsInsertRowOptions,
  ChatLog,
} from '@sniper.io/schemas'
import { parseCellValues } from './helpers/parseCellValues'
import { getAuthenticatedGoogleDoc } from './helpers/getAuthenticatedGoogleDoc'
import { ExecuteIntegrationResponse } from '../../../types'

export const insertRow = async (
  state: SessionState,
  {
    outgoingEdgeId,
    options,
  }: { outgoingEdgeId?: string; options: GoogleSheetsInsertRowOptions }
): Promise<ExecuteIntegrationResponse> => {
  const { variables } = state.snipersQueue[0].sniper
  if (!options.cellsToInsert || !options.sheetId) return { outgoingEdgeId }

  const logs: ChatLog[] = []

  const doc = await getAuthenticatedGoogleDoc({
    credentialsId: options.credentialsId,
    spreadsheetId: options.spreadsheetId,
  })

  const parsedValues = parseCellValues(variables)(options.cellsToInsert)

  try {
    await doc.loadInfo()
    const sheet = doc.sheetsById[Number(options.sheetId)]
    await sheet.addRow(parsedValues)
    logs.push({
      status: 'success',
      description: `Succesfully inserted row in ${doc.title} > ${sheet.title}`,
    })
  } catch (err) {
    logs.push({
      status: 'error',
      description: `An error occured while inserting the row`,
      details: err,
    })
  }

  return { outgoingEdgeId, logs }
}
