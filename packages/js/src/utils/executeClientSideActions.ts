import { executeChatwoot } from '@/features/blocks/integrations/chatwoot'
import { executeGoogleAnalyticsBlock } from '@/features/blocks/integrations/googleAnalytics/utils/executeGoogleAnalytics'
import { executeRedirect } from '@/features/blocks/logic/redirect'
import { executeScript } from '@/features/blocks/logic/script/executeScript'
import { executeWait } from '@/features/blocks/logic/wait/utils/executeWait'
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
  if ('scriptToExecute' in clientSideAction) {
    await executeScript(clientSideAction.scriptToExecute)
  }
  if ('redirect' in clientSideAction) {
    executeRedirect(clientSideAction.redirect)
  }
  if ('wait' in clientSideAction) {
    await executeWait(clientSideAction.wait)
  }
}
