import { executeChatwoot } from '@/features/blocks/integrations/chatwoot'
import { executeGoogleAnalyticsBlock } from '@/features/blocks/integrations/googleAnalytics/utils/executeGoogleAnalytics'
import { executeCode } from '@/features/blocks/logic/code'
import { executeRedirect } from '@/features/blocks/logic/redirect'
import type { ChatReply } from 'models'

export const executeClientSideAction = async (
  clientSideAction: NonNullable<ChatReply['clientSideActions']>[0]
) => {
  if ('chatwoot' in clientSideAction) {
    executeChatwoot(clientSideAction.chatwoot)
  }
  if ('googleAnalytics' in clientSideAction) {
    executeGoogleAnalyticsBlock(clientSideAction.googleAnalytics)
  }
  if ('codeToExecute' in clientSideAction) {
    await executeCode(clientSideAction.codeToExecute)
  }
  if ('redirect' in clientSideAction) {
    executeRedirect(clientSideAction.redirect)
  }
}
