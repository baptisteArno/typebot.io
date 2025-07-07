import {
  ContinueChatResponse,
  ChatSession,
  SetVariableHistoryItem,
} from '@typebot.io/schemas'
import { upsertResult } from './queries/upsertResult'
import { updateSession } from './queries/updateSession'
import { createSession } from './queries/createSession'
import { deleteSession } from './queries/deleteSession'
import { Prisma, VisitedEdge } from '@typebot.io/prisma'
import prisma from '@typebot.io/lib/prisma'
import logger from '@typebot.io/lib/logger'

type Props = {
  session: Pick<ChatSession, 'state'> & { id?: string }
  input: ContinueChatResponse['input']
  logs: ContinueChatResponse['logs']
  clientSideActions: ContinueChatResponse['clientSideActions']
  visitedEdges: VisitedEdge[]
  setVariableHistory: SetVariableHistoryItem[]
  hasCustomEmbedBubble?: boolean
  initialSessionId?: string
}

export const saveStateToDatabase = async ({
  session: { state, id },
  input,
  logs,
  clientSideActions,
  visitedEdges,
  setVariableHistory,
  hasCustomEmbedBubble,
  initialSessionId,
}: Props) => {
  logger.info('saveStateToDatabase called', {
    hasExistingSessionId: !!id,
    existingSessionId: id,
    initialSessionId,
    resultId: state.typebotsQueue[0]?.resultId,
    typebotId: state.typebotsQueue[0]?.typebot?.id,
    hasInput: !!input,
    inputId: input?.id,
    hasCustomEmbedBubble,
    answersCount: state.typebotsQueue[0]?.answers?.length || 0,
  })

  const containsSetVariableClientSideAction = clientSideActions?.some(
    (action) => action.expectsDedicatedReply
  )

  const isCompleted = Boolean(
    !input && !containsSetVariableClientSideAction && !hasCustomEmbedBubble
  )

  const queries: Prisma.PrismaPromise<any>[] = []

  const resultId = state.typebotsQueue[0].resultId

  logger.info('saveStateToDatabase session handling', {
    hasExistingSessionId: !!id,
    existingSessionId: id,
    initialSessionId,
    resultId,
    isCompleted,
    willDeleteSession: !!(id && isCompleted && resultId),
    willUpdateSession: !!(id && !(isCompleted && resultId)),
    willCreateSession: !id,
  })

  if (id) {
    if (isCompleted && resultId) queries.push(deleteSession(id))
    else queries.push(updateSession({ id, state, isReplying: false }))
  }

  const session = id
    ? { state, id }
    : await createSession({ id: initialSessionId, state, isReplying: false })

  logger.info('saveStateToDatabase session result', {
    sessionId: session.id,
    resultId,
    isCompleted,
    hasQueries: queries.length > 0,
    sessionIdMatches: initialSessionId ? session.id === initialSessionId : 'N/A',
  })

  if (!resultId) {
    if (queries.length > 0) await prisma.$transaction(queries)
    return session
  }

  const answers = state.typebotsQueue[0].answers

  queries.push(
    upsertResult({
      resultId,
      typebot: state.typebotsQueue[0].typebot,
      isCompleted: Boolean(
        !input && !containsSetVariableClientSideAction && answers.length > 0
      ),
      hasStarted: answers.length > 0,
      lastChatSessionId: session.id,
      logs,
      visitedEdges,
      setVariableHistory,
    })
  )

  await prisma.$transaction(queries)

  logger.info('saveStateToDatabase completed successfully', {
    sessionId: session.id,
    resultId,
    typebotId: state.typebotsQueue[0]?.typebot?.id,
    isCompleted: Boolean(
      !input && !containsSetVariableClientSideAction && answers.length > 0
    ),
    hasStarted: answers.length > 0,
    queriesExecuted: queries.length,
  })

  return session
}
