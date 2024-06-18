import { ExecuteIntegrationResponse } from '../../../../types'
import { GoogleAnalyticsBlock, SessionState } from '@sniper.io/schemas'
import { deepParseVariables } from '@sniper.io/variables/deepParseVariables'

export const executeGoogleAnalyticsBlock = (
  state: SessionState,
  block: GoogleAnalyticsBlock
): ExecuteIntegrationResponse => {
  const { sniper, resultId } = state.snipersQueue[0]
  if (!resultId || state.whatsApp || !block.options)
    return { outgoingEdgeId: block.outgoingEdgeId }
  const googleAnalytics = deepParseVariables(sniper.variables, {
    guessCorrectTypes: true,
    removeEmptyStrings: true,
  })(block.options)
  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions: [
      {
        type: 'googleAnalytics',
        googleAnalytics,
      },
    ],
  }
}
