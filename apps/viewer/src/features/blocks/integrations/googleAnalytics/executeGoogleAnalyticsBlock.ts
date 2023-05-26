import { ExecuteIntegrationResponse } from '@/features/chat/types'
import { deepParseVariables } from '@/features/variables/deepParseVariable'
import { isNotEmpty } from '@typebot.io/lib'
import { GoogleAnalyticsBlock, SessionState } from '@typebot.io/schemas'

export const executeGoogleAnalyticsBlock = (
  { typebot: { variables } }: SessionState,
  block: GoogleAnalyticsBlock
): ExecuteIntegrationResponse => {
  const googleAnalytics = deepParseVariables(variables)(block.options)
  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions: [
      {
        googleAnalytics: {
          ...googleAnalytics,
          value: isNotEmpty(googleAnalytics.value as string)
            ? Number(googleAnalytics.value)
            : undefined,
        },
      },
    ],
  }
}
