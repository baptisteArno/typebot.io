import { ContinueChatResponse, ChatSession } from '@typebot.io/schemas'
import { upsertResult } from './queries/upsertResult'
import { saveLogs } from './queries/saveLogs'
import { updateSession } from './queries/updateSession'
import { formatLogDetails } from './logs/helpers/formatLogDetails'
import { createSession } from './queries/createSession'
import { deleteSession } from './queries/deleteSession'
import * as Sentry from '@sentry/nextjs'
import { saveVisitedEdges } from './queries/saveVisitedEdges'
import { Prisma, VisitedEdge } from '@typebot.io/prisma'
import prisma from '@typebot.io/lib/prisma'

type Props = {
  session: Pick<ChatSession, 'state'> & { id?: string }
  input: ContinueChatResponse['input']
  logs: ContinueChatResponse['logs']
  clientSideActions: ContinueChatResponse['clientSideActions']
  visitedEdges: VisitedEdge[]
  forceCreateSession?: boolean
  hasCustomEmbedBubble?: boolean
}

export const saveStateToDatabase = async ({
  session: { state, id },
  input,
  logs,
  clientSideActions,
  forceCreateSession,
  visitedEdges,
  hasCustomEmbedBubble,
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
    else queries.push(updateSession({ id, state }))
  }

  const session =
    id && !forceCreateSession
      ? { state, id }
      : await createSession({ id, state })

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
    })
  )

  if (logs && logs.length > 0)
    try {
      await saveLogs(
        logs.map((log) => ({
          ...log,
          resultId,
          details: formatLogDetails(log.details),
        }))
      )
    } catch (e) {
      console.error('Failed to save logs', e)
      Sentry.captureException(e)
    }

  if (visitedEdges.length > 0) queries.push(saveVisitedEdges(visitedEdges))

  await prisma.$transaction(queries)

  return session
}
