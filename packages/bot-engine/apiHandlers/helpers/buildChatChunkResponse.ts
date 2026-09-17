import { isNotDefined } from '@typebot.io/lib/utils'
import { filterPotentiallySensitiveLogs } from '../../logs/filterPotentiallySensitiveLogs'
import { parseDynamicTheme } from '../../parseDynamicTheme'
import { computeCurrentProgress } from '../../computeCurrentProgress'
import { continueBotFlow } from '../../continueBotFlow'

/**
 * Shapes the result of a resumed or freshly-started flow into the same
 * envelope `continueChat` returns, so a webhook caller can relay `messages`
 * to the end user exactly as it would for any other chat turn.
 */
export const buildChatChunkResponse = ({
  sessionId,
  messages,
  input,
  clientSideActions,
  newSessionState,
  logs,
  lastMessageNewFormat,
}: Pick<
  Awaited<ReturnType<typeof continueBotFlow>>,
  | 'messages'
  | 'input'
  | 'clientSideActions'
  | 'newSessionState'
  | 'logs'
  | 'lastMessageNewFormat'
> & { sessionId: string }) => {
  const isPreview = isNotDefined(newSessionState.typebotsQueue[0].resultId)

  const isEnded =
    newSessionState.progressMetadata &&
    !input?.id &&
    (clientSideActions?.filter((c) => c.expectsDedicatedReply).length ?? 0) ===
      0

  return {
    sessionId,
    messages,
    input,
    clientSideActions,
    dynamicTheme: parseDynamicTheme(newSessionState),
    logs: isPreview ? logs : logs?.filter(filterPotentiallySensitiveLogs),
    lastMessageNewFormat,
    progress: newSessionState.progressMetadata
      ? isEnded
        ? 100
        : computeCurrentProgress({
            typebotsQueue: newSessionState.typebotsQueue,
            progressMetadata: newSessionState.progressMetadata,
            currentInputBlockId: input?.id,
          })
      : undefined,
  }
}
