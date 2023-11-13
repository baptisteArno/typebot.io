import { ContinueChatResponse, ChatSession } from '@typebot.io/schemas'
import { upsertResult } from './queries/upsertResult'
import { saveLogs } from './queries/saveLogs'
import { updateSession } from './queries/updateSession'
import { formatLogDetails } from './logs/helpers/formatLogDetails'
import { createSession } from './queries/createSession'
import { deleteSession } from './queries/deleteSession'
import * as Sentry from '@sentry/nextjs'
import { saveVisitedEdges } from './queries/saveVisitedEdges'
import { VisitedEdge } from '@typebot.io/prisma'

type Props = {
  session: Pick<ChatSession, 'state'> & { id?: string }
  input: ContinueChatResponse['input']
  logs: ContinueChatResponse['logs']
  clientSideActions: ContinueChatResponse['clientSideActions']
  visitedEdges: VisitedEdge[]
  forceCreateSession?: boolean
}

export const saveStateToDatabase = async ({
  session: { state, id },
  input,
  logs,
  clientSideActions,
  forceCreateSession,
  visitedEdges,
}: Props) => {
  const containsSetVariableClientSideAction = clientSideActions?.some(
    (action) => action.expectsDedicatedReply
  )

  const isCompleted = Boolean(!input && !containsSetVariableClientSideAction)

  const resultId = state.typebotsQueue[0].resultId

  if (id) {
    if (isCompleted && resultId) await deleteSession(id)
    else await updateSession({ id, state })
  }

  const session =
    id && !forceCreateSession
      ? { state, id }
      : await createSession({ id, state })

  if (!resultId) return session

  const answers = state.typebotsQueue[0].answers

  await upsertResult({
    resultId,
    typebot: state.typebotsQueue[0].typebot,
    isCompleted: Boolean(
      !input && !containsSetVariableClientSideAction && answers.length > 0
    ),
    hasStarted: answers.length > 0,
  })

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

  if (visitedEdges.length > 0) await saveVisitedEdges(visitedEdges)

  return session
}
