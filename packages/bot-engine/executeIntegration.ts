import { executeSendEmailBlock } from './blocks/integrations/sendEmail/executeSendEmailBlock'
import { executeWebhookBlock } from './blocks/integrations/webhook/executeWebhookBlock'
import { executeChatwootBlock } from './blocks/integrations/chatwoot/executeChatwootBlock'
import { executeGoogleAnalyticsBlock } from './blocks/integrations/legacy/googleAnalytics/executeGoogleAnalyticsBlock'
import { executeGoogleSheetBlock } from './blocks/integrations/googleSheets/executeGoogleSheetBlock'
import { executePixelBlock } from './blocks/integrations/pixel/executePixelBlock'
import { IntegrationBlock, SessionState } from '@typebot.io/schemas'
import { ExecuteIntegrationResponse } from './types'
import { IntegrationBlockType } from '@typebot.io/schemas/features/blocks/integrations/constants'
import { executeOpenAIBlock } from './blocks/integrations/legacy/openai/executeOpenAIBlock'
import { executeForgedBlock } from './forge/executeForgedBlock'
import { isNotDefined } from '@typebot.io/lib'
import { env } from '@typebot.io/env'

export const executeIntegration =
  (state: SessionState) =>
  async (block: IntegrationBlock): Promise<ExecuteIntegrationResponse> => {
    switch (block.type) {
      case IntegrationBlockType.GOOGLE_SHEETS:
        return {
          ...(await executeGoogleSheetBlock(state, block)),
          startTimeShouldBeUpdated: true,
        }
      case IntegrationBlockType.CHATWOOT:
        return executeChatwootBlock(state, block)
      case IntegrationBlockType.GOOGLE_ANALYTICS:
        return executeGoogleAnalyticsBlock(state, block)
      case IntegrationBlockType.EMAIL:
        return executeSendEmailBlock(state, block)
      case IntegrationBlockType.ZAPIER:
      case IntegrationBlockType.MAKE_COM:
      case IntegrationBlockType.PABBLY_CONNECT:
        return {
          ...(await executeWebhookBlock(state, block, {
            disableRequestTimeout: true,
          })),
          startTimeShouldBeUpdated: true,
        }
      case IntegrationBlockType.WEBHOOK:
        return {
          ...(await executeWebhookBlock(state, block, {
            disableRequestTimeout: isNotDefined(env.CHAT_API_TIMEOUT),
          })),
        }
      case IntegrationBlockType.OPEN_AI:
        return {
          ...(await executeOpenAIBlock(state, block)),
          startTimeShouldBeUpdated: true,
        }
      case IntegrationBlockType.PIXEL:
        return executePixelBlock(state, block)
      default:
        return {
          ...(await executeForgedBlock(state, block)),
          startTimeShouldBeUpdated: true,
        }
    }
  }
