import { StartFrom, StartSniper } from '@sniper.io/schemas'
import { restartSession } from '../queries/restartSession'
import { saveStateToDatabase } from '../saveStateToDatabase'
import { startSession } from '../startSession'
import { computeCurrentProgress } from '../computeCurrentProgress'
import { BubbleBlockType } from '@sniper.io/schemas/features/blocks/bubbles/constants'

type Props = {
  message?: string
  isOnlyRegistering: boolean
  isStreamEnabled: boolean
  startFrom?: StartFrom
  sniperId: string
  sniper?: StartSniper
  userId?: string
  prefilledVariables?: Record<string, unknown>
  sessionId?: string
  textBubbleContentFormat: 'richText' | 'markdown'
}

export const startChatPreview = async ({
  message,
  isOnlyRegistering,
  isStreamEnabled,
  startFrom,
  sniperId,
  sniper: startSniper,
  userId,
  prefilledVariables,
  sessionId,
  textBubbleContentFormat,
}: Props) => {
  const {
    sniper,
    messages,
    input,
    dynamicTheme,
    logs,
    clientSideActions,
    newSessionState,
    visitedEdges,
    setVariableHistory,
  } = await startSession({
    version: 2,
    startParams: {
      type: 'preview',
      isOnlyRegistering,
      isStreamEnabled,
      startFrom,
      sniperId,
      sniper: startSniper,
      userId,
      prefilledVariables,
      sessionId,
      textBubbleContentFormat,
    },
    message,
  })

  const session = isOnlyRegistering
    ? await restartSession({
        state: newSessionState,
      })
    : await saveStateToDatabase({
        session: {
          state: newSessionState,
        },
        input,
        logs,
        clientSideActions,
        visitedEdges,
        setVariableHistory,
        hasEmbedBubbleWithWaitEvent: messages.some(
          (message) =>
            message.type === 'custom-embed' ||
            (message.type === BubbleBlockType.EMBED &&
              message.content.waitForEvent?.isEnabled)
        ),
        initialSessionId: sessionId,
      })

  const isEnded =
    newSessionState.progressMetadata &&
    !input?.id &&
    (clientSideActions?.filter((c) => c.expectsDedicatedReply).length ?? 0) ===
      0

  return {
    sessionId: session.id,
    sniper: {
      id: sniper.id,
      theme: sniper.theme,
      settings: sniper.settings,
    },
    messages,
    input,
    dynamicTheme,
    logs,
    clientSideActions,
    progress: newSessionState.progressMetadata
      ? isEnded
        ? 100
        : computeCurrentProgress({
            snipersQueue: newSessionState.snipersQueue,
            progressMetadata: newSessionState.progressMetadata,
            currentInputBlockId: input?.id,
          })
      : undefined,
  }
}
