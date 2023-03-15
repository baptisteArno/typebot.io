import { executeChatwootBlock } from '@/features/blocks/integrations/chatwoot'
import { executeGoogleAnalyticsBlock } from '@/features/blocks/integrations/googleAnalytics'
import { executeGoogleSheetBlock } from '@/features/blocks/integrations/googleSheets'
import { executeSendEmailBlock } from '@/features/blocks/integrations/sendEmail'
import { executeWebhook } from '@/features/blocks/integrations/webhook'
import { IntegrationState } from '@/types'
import { IntegrationBlock, IntegrationBlockType } from '@typebot.io/schemas'

export const executeIntegration = ({
  block,
  context,
}: {
  block: IntegrationBlock
  context: IntegrationState
}): Promise<string | undefined> | string | undefined => {
  switch (block.type) {
    case IntegrationBlockType.GOOGLE_SHEETS:
      return executeGoogleSheetBlock(block, context)
    case IntegrationBlockType.GOOGLE_ANALYTICS:
      return executeGoogleAnalyticsBlock(block, context)
    case IntegrationBlockType.ZAPIER:
    case IntegrationBlockType.MAKE_COM:
    case IntegrationBlockType.PABBLY_CONNECT:
    case IntegrationBlockType.WEBHOOK:
      return executeWebhook(block, context)
    case IntegrationBlockType.EMAIL:
      return executeSendEmailBlock(block, context)
    case IntegrationBlockType.CHATWOOT:
      return executeChatwootBlock(block, context)
    default:
      return
  }
}
