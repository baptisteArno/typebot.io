import { ExecuteIntegrationResponse } from '@/features/chat/types'
import { deepParseVariables } from '@/features/variables/deepParseVariable'
import { GoogleAnalyticsBlock, SessionState } from '@typebot.io/schemas'

export const executeGoogleAnalyticsBlock = (
  { typebot: { variables } }: SessionState,
  block: GoogleAnalyticsBlock,
  lastBubbleBlockId?: string
): ExecuteIntegrationResponse => ({
  outgoingEdgeId: block.outgoingEdgeId,
  clientSideActions: [
    {
      googleAnalytics: deepParseVariables(variables)(block.options),
      lastBubbleBlockId,
    },
  ],
})
