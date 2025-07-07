import { computeCurrentProgress } from '../computeCurrentProgress'
import { filterPotentiallySensitiveLogs } from '../logs/filterPotentiallySensitiveLogs'
import { restartSession } from '../queries/restartSession'
import { saveStateToDatabase } from '../saveStateToDatabase'
import { startSession } from '../startSession'
import logger from '@typebot.io/lib/logger'

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
  logger.info('startChat called', {
    publicId,
    hasMessage: !!message,
    isOnlyRegistering,
    isStreamEnabled,
    hasPrefilledVariables: !!prefilledVariables,
    hasResultId: !!startResultId,
    textBubbleContentFormat,
    origin,
  })

  try {
    const {
      typebot,
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

  logger.info('startSession completed', {
    publicId,
    typebotId: typebot.id,
    hasMessages: !!messages && messages.length > 0,
    hasInput: !!input,
    hasResultId: !!resultId,
    hasNewSessionState: !!newSessionState,
    allowedOrigins: newSessionState.allowedOrigins,
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

  logger.info('startChat session save mode', {
    publicId,
    isOnlyRegistering,
    typebotId: typebot.id,
    resultId,
    corsOrigin,
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
        hasCustomEmbedBubble: messages.some(
          (message) => message.type === 'custom-embed'
        ),
      })

  logger.info('Session saved successfully', {
    publicId,
    sessionId: session.id,
    typebotId: typebot.id,
    resultId,
    isOnlyRegistering,
  })

  logger.info('startChat session details for continueChat troubleshooting', {
    publicId,
    sessionId: session.id,
    typebotId: typebot.id,
    resultId,
    sessionCreatedAt: new Date().toISOString(),
    sessionStateKeys: newSessionState ? Object.keys(newSessionState).length : 0,
    hasInput: !!input,
    inputId: input?.id,
    inputType: input?.type,
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
    resultId,
    dynamicTheme,
    logs: logs?.filter(filterPotentiallySensitiveLogs),
    clientSideActions,
    corsOrigin,
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
  } catch (error) {
    logger.error('Error in startChat', {
      publicId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      origin,
      isOnlyRegistering,
    })
    throw error
  }
}
