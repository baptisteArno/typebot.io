import { executeChatwootBlock } from '@/features/blocks/integrations/chatwoot/api'
import { executeGoogleAnalyticsBlock } from '@/features/blocks/integrations/googleAnalytics/api'
import { executeGoogleSheetBlock } from '@/features/blocks/integrations/googleSheets/api'
import { executeOpenAIBlock } from '@/features/blocks/integrations/openai/executeOpenAIBlock'
import { executeSendEmailBlock } from '@/features/blocks/integrations/sendEmail/api'
import { executeWebhookBlock } from '@/features/blocks/integrations/webhook/api'
import { IntegrationBlock, IntegrationBlockType, SessionState } from 'models'
import { ExecuteIntegrationResponse } from '../../types'

export const executeIntegration =
  (state: SessionState, lastBubbleBlockId?: string) =>
  async (block: IntegrationBlock): Promise<ExecuteIntegrationResponse> => {
    switch (block.type) {
      case IntegrationBlockType.GOOGLE_SHEETS:
        return executeGoogleSheetBlock(state, block)
      case IntegrationBlockType.CHATWOOT:
        return executeChatwootBlock(state, block, lastBubbleBlockId)
      case IntegrationBlockType.GOOGLE_ANALYTICS:
        return executeGoogleAnalyticsBlock(state, block, lastBubbleBlockId)
      case IntegrationBlockType.EMAIL:
        return executeSendEmailBlock(state, block)
      case IntegrationBlockType.WEBHOOK:
      case IntegrationBlockType.ZAPIER:
      case IntegrationBlockType.MAKE_COM:
      case IntegrationBlockType.PABBLY_CONNECT:
        return executeWebhookBlock(state, block)
      case IntegrationBlockType.OPEN_AI:
        return executeOpenAIBlock(state, block)
    }
  }
