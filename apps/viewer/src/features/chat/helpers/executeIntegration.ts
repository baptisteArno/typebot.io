import { executeOpenAIBlock } from '@/features/blocks/integrations/openai/executeOpenAIBlock'
import { executeSendEmailBlock } from '@/features/blocks/integrations/sendEmail/executeSendEmailBlock'
import { executeWebhookBlock } from '@/features/blocks/integrations/webhook/executeWebhookBlock'
import { executeChatwootBlock } from '@/features/blocks/integrations/chatwoot/executeChatwootBlock'
import { executeGoogleAnalyticsBlock } from '@/features/blocks/integrations/googleAnalytics/executeGoogleAnalyticsBlock'
import { executeGoogleSheetBlock } from '@/features/blocks/integrations/googleSheets/executeGoogleSheetBlock'
import {
  IntegrationBlock,
  IntegrationBlockType,
  SessionState,
} from '@typebot.io/schemas'
import { ExecuteIntegrationResponse } from '../types'

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
