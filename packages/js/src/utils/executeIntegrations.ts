import { executeChatwoot } from '@/features/blocks/integrations/chatwoot'
import { executeGoogleAnalyticsBlock } from '@/features/blocks/integrations/googleAnalytics/utils/executeGoogleAnalytics'
import { ChatReply } from 'models'

export const executeIntegrations = async (
  integrations: ChatReply['integrations']
) => {
  if (integrations?.chatwoot?.codeToExecute) {
    executeChatwoot(integrations.chatwoot)
  }
  if (integrations?.googleAnalytics) {
    executeGoogleAnalyticsBlock(integrations.googleAnalytics)
  }
}
