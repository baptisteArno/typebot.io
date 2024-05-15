import { GoogleSheetsBlock, SessionState } from '@typebot.io/schemas'
import { insertRow } from './insertRow'
import { updateRow } from './updateRow'
import { getRow } from './getRow'
import { ExecuteIntegrationResponse } from '../../../types'
import { GoogleSheetsAction } from '@typebot.io/schemas/features/blocks/integrations/googleSheets/constants'

export const executeGoogleSheetBlock = async (
  state: SessionState,
  block: GoogleSheetsBlock
): Promise<ExecuteIntegrationResponse> => {
  if (!block.options) return { outgoingEdgeId: block.outgoingEdgeId }
  const action = block.options.action
  if (!action) return { outgoingEdgeId: block.outgoingEdgeId }
  switch (action) {
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
        blockId: block.id,
        options: block.options,
        outgoingEdgeId: block.outgoingEdgeId,
      })
  }
}
