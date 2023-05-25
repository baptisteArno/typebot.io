import { executeChatwoot } from '@/features/blocks/integrations/chatwoot'
import { executeGoogleAnalyticsBlock } from '@/features/blocks/integrations/googleAnalytics/utils/executeGoogleAnalytics'
import { executeRedirect } from '@/features/blocks/logic/redirect'
import { executeScript } from '@/features/blocks/logic/script/executeScript'
import { executeSetVariable } from '@/features/blocks/logic/setVariable/executeSetVariable'
import { executeWait } from '@/features/blocks/logic/wait/utils/executeWait'
import { getOpenAiStreamerQuery } from '@/queries/getOpenAiStreamerQuery'
import type { ChatReply } from '@typebot.io/schemas'

type ClientSideActionContext = {
  apiHost?: string
  sessionId: string
}

export const executeClientSideAction = async (
  clientSideAction: NonNullable<ChatReply['clientSideActions']>[0],
  context: ClientSideActionContext,
  onStreamedMessage?: (message: string) => void
): Promise<
  { blockedPopupUrl: string } | { replyToSend: string | undefined } | void
> => {
  if ('chatwoot' in clientSideAction) {
    return executeChatwoot(clientSideAction.chatwoot)
  }
  if ('googleAnalytics' in clientSideAction) {
    return executeGoogleAnalyticsBlock(clientSideAction.googleAnalytics)
  }
  if ('scriptToExecute' in clientSideAction) {
    return executeScript(clientSideAction.scriptToExecute)
  }
  if ('redirect' in clientSideAction) {
    return executeRedirect(clientSideAction.redirect)
  }
  if ('wait' in clientSideAction) {
    return executeWait(clientSideAction.wait)
  }
  if ('setVariable' in clientSideAction) {
    return executeSetVariable(clientSideAction.setVariable.scriptToExecute)
  }
  if ('streamOpenAiChatCompletion' in clientSideAction) {
    const text = await streamChat(context)(
      clientSideAction.streamOpenAiChatCompletion.messages,
      { onStreamedMessage }
    )
    return { replyToSend: text }
  }
}

const streamChat =
  (context: ClientSideActionContext) =>
  async (
    messages: {
      content?: string | undefined
      role?: 'system' | 'user' | 'assistant' | undefined
    }[],
    { onStreamedMessage }: { onStreamedMessage?: (message: string) => void }
  ) => {
    const data = await getOpenAiStreamerQuery(context)(messages)

    if (!data) {
      return
    }

    const reader = data.getReader()
    const decoder = new TextDecoder()
    let done = false

    let message = ''
    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      const chunkValue = decoder.decode(value)
      message += chunkValue
      onStreamedMessage?.(message)
    }
    return message
  }
