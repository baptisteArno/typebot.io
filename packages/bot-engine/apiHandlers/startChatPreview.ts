import { StartFrom, StartTypebot } from '@typebot.io/schemas'
import { restartSession } from '../queries/restartSession'
import { saveStateToDatabase } from '../saveStateToDatabase'
import { startSession } from '../startSession'
import { computeCurrentProgress } from '../computeCurrentProgress'

type Props = {
  message?: string
  isOnlyRegistering: boolean
  isStreamEnabled: boolean
  startFrom?: StartFrom
  typebotId: string
  typebot?: StartTypebot
  userId?: string
  prefilledVariables?: Record<string, unknown>
}

export const startChatPreview = async ({
  message,
  isOnlyRegistering,
  isStreamEnabled,
  startFrom,
  typebotId,
  typebot: startTypebot,
  userId,
  prefilledVariables,
}: Props) => {
  const {
    typebot,
    messages,
    input,
    dynamicTheme,
    logs,
    clientSideActions,
    newSessionState,
    visitedEdges,
  } = await startSession({
    version: 2,
    startParams: {
      type: 'preview',
      isOnlyRegistering,
      isStreamEnabled,
      startFrom,
      typebotId,
      typebot: startTypebot,
      userId,
      prefilledVariables,
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
        hasCustomEmbedBubble: messages.some(
          (message) => message.type === 'custom-embed'
        ),
      })

  const isEnded =
    newSessionState.progressMetadata &&
    !input?.id &&
    (clientSideActions?.filter((c) => c.expectsDedicatedReply).length ?? 0) ===
      0

  return {
    sessionId: session.id,
    typebot: {
      id: typebot.id,
      theme: typebot.theme,
      settings: typebot.settings,
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
            typebotsQueue: newSessionState.typebotsQueue,
            progressMetadata: newSessionState.progressMetadata,
            currentInputBlockId: input?.id,
          })
      : undefined,
  }
}
