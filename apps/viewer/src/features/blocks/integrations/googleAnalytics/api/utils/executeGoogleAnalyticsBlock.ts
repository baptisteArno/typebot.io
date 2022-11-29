import { ExecuteIntegrationResponse } from '@/features/chat'
import { parseVariablesInObject } from '@/features/variables'
import { GoogleAnalyticsBlock, SessionState } from 'models'

export const executeGoogleAnalyticsBlock = (
  { typebot: { variables } }: SessionState,
  block: GoogleAnalyticsBlock
): ExecuteIntegrationResponse => ({
  outgoingEdgeId: block.outgoingEdgeId,
  integrations: {
    googleAnalytics: parseVariablesInObject(block.options, variables),
  },
})
