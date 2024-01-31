import { StartFrom, StartTypebot } from '@typebot.io/schemas'
import { restartSession } from '../queries/restartSession'
import { saveStateToDatabase } from '../saveStateToDatabase'
import { startSession } from '../startSession'

type Props = {
  message?: string
  isOnlyRegistering: boolean
  isStreamEnabled: boolean
  startFrom?: StartFrom
  typebotId: string
  typebot?: StartTypebot
  userId?: string
}

export const startChatPreview = async ({
  message,
  isOnlyRegistering,
  isStreamEnabled,
  startFrom,
  typebotId,
  typebot: startTypebot,
  userId,
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
  }
}
