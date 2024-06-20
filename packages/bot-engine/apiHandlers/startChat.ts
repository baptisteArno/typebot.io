import { BubbleBlockType } from '@sniper.io/schemas/features/blocks/bubbles/constants'
import { computeCurrentProgress } from '../computeCurrentProgress'
import { filterPotentiallySensitiveLogs } from '../logs/filterPotentiallySensitiveLogs'
import { restartSession } from '../queries/restartSession'
import { saveStateToDatabase } from '../saveStateToDatabase'
import { startSession } from '../startSession'
import { isNotEmpty } from '@sniper.io/lib'

type Props = {
  origin: string | undefined
  message?: string
  isOnlyRegistering: boolean
  publicId: string
  isStreamEnabled: boolean
  prefilledVariables?: Record<string, unknown>
  resultId?: string
  textBubbleContentFormat: 'richText' | 'markdown'
}

export const startChat = async ({
  origin,
  message,
  isOnlyRegistering,
  publicId,
  isStreamEnabled,
  prefilledVariables,
  resultId: startResultId,
  textBubbleContentFormat,
}: Props) => {
  const {
    sniper,
    messages,
    input,
    resultId,
    dynamicTheme,
    logs,
    clientSideActions,
    newSessionState,
    visitedEdges,
    setVariableHistory,
  } = await startSession({
    version: 2,
    startParams: {
      type: 'live',
      isOnlyRegistering,
      isStreamEnabled,
      publicId,
      prefilledVariables,
      resultId: startResultId,
      textBubbleContentFormat,
    },
    message,
  })

  let corsOrigin

  if (
    newSessionState.allowedOrigins &&
    newSessionState.allowedOrigins.length > 0
  ) {
    if (origin && newSessionState.allowedOrigins.includes(origin))
      corsOrigin = origin
    else corsOrigin = newSessionState.allowedOrigins[0]
  }

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
    resultId,
    dynamicTheme,
    logs: logs?.filter(filterPotentiallySensitiveLogs),
    clientSideActions,
    corsOrigin,
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
