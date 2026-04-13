import {
  ContinueChatResponse,
  ChatSession,
  SetVariableHistoryItem,
  VisitedBlockEntry,
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
  visitedBlocks?: VisitedBlockEntry[]
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
  visitedBlocks,
  setVariableHistory,
  hasCustomEmbedBubble,
  initialSessionId,
}: Props) => {
  const containsSetVariableClientSideAction = clientSideActions?.some(
    (action) => action.expectsDedicatedReply
  )

  const isCompleted = Boolean(
    !input && !containsSetVariableClientSideAction && !hasCustomEmbedBubble
  )

  const queries: Prisma.PrismaPromise<any>[] = []

  const resultId = state.typebotsQueue[0].resultId

  if (id) {
    if (isCompleted && resultId) queries.push(deleteSession(id))
    else queries.push(updateSession({ id, state, isReplying: false }))
  }

  const session = id
    ? { state, id }
    : await createSession({ id: initialSessionId, state, isReplying: false })

  if (!resultId) {
    if (queries.length > 0) await prisma.$transaction(queries)
    return session
  }

  const answers = state.typebotsQueue[0].answers

  const resultIsCompleted = Boolean(
    !input && !containsSetVariableClientSideAction && answers.length > 0
  )

  const hasDeadEnd = visitedBlocks?.some((b) => b.status === 'dead_end')
  const hasErrorBlock = visitedBlocks?.some((b) => b.status === 'error')
  const derivedStatus = hasDeadEnd
    ? 'error'
    : resultIsCompleted
    ? 'completed'
    : hasErrorBlock
    ? 'error'
    : 'abandoned'

  queries.push(
    upsertResult({
      resultId,
      typebot: state.typebotsQueue[0].typebot,
      isCompleted: resultIsCompleted,
      hasStarted: answers.length > 0,
      lastChatSessionId: session.id,
      logs,
      visitedEdges,
      setVariableHistory,
      status: derivedStatus,
    })
  )

  // Atomic append to avoid read-then-write race condition on concurrent requests
  if (visitedBlocks && visitedBlocks.length > 0) {
    const blocksJson = JSON.stringify(visitedBlocks)
    queries.push(
      prisma.$queryRaw`
        UPDATE "Result"
        SET "visitedBlocks" = COALESCE("visitedBlocks", '[]'::jsonb) || ${blocksJson}::jsonb
        WHERE id = ${resultId}
      `
    )
  }

  await prisma.$transaction(queries)

  logger.debug('saveStateToDatabase completed', {
    sessionId: session.id,
    resultId,
    isCompleted: resultIsCompleted,
  })

  return session
}
