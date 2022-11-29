import { ExecuteIntegrationResponse } from '@/features/chat'
import { GoogleSheetsBlock, GoogleSheetsAction, SessionState } from 'models'
import { getRow } from './getRow'
import { insertRow } from './insertRow'
import { updateRow } from './updateRow'

export const executeGoogleSheetBlock = async (
  state: SessionState,
  block: GoogleSheetsBlock
): Promise<ExecuteIntegrationResponse> => {
  if (!('action' in block.options))
    return { outgoingEdgeId: block.outgoingEdgeId }
  switch (block.options.action) {
    case GoogleSheetsAction.INSERT_ROW:
      return insertRow(state, {
        options: block.options,
        outgoingEdgeId: block.outgoingEdgeId,
      })
    case GoogleSheetsAction.UPDATE_ROW:
      return updateRow(state, {
        options: block.options,
        outgoingEdgeId: block.outgoingEdgeId,
      })
    case GoogleSheetsAction.GET:
      return getRow(state, {
        options: block.options,
        outgoingEdgeId: block.outgoingEdgeId,
      })
  }
}
