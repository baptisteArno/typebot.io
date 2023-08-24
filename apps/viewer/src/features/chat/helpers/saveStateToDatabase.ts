import { ChatReply, ChatSession } from '@typebot.io/schemas'
import { upsertResult } from '../queries/upsertResult'
import { saveLogs } from '../queries/saveLogs'
import { updateSession } from '../queries/updateSession'
import { formatLogDetails } from '@/features/logs/helpers/formatLogDetails'
import { createSession } from '../queries/createSession'

type Props = {
  session: Pick<ChatSession, 'state'> & { id?: string }
  input: ChatReply['input']
  logs: ChatReply['logs']
  clientSideActions: ChatReply['clientSideActions']
}

export const saveStateToDatabase = async ({
  session: { state, id },
  input,
  logs,
  clientSideActions,
}: Props) => {
  if (id) await updateSession({ id, state })

  const session = id ? { state, id } : await createSession({ state })

  const resultId = state.typebotsQueue[0].resultId

  if (!resultId) return session

  const containsSetVariableClientSideAction = clientSideActions?.some(
    (action) => 'setVariable' in action
  )

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
    await saveLogs(
      logs.map((log) => ({
        ...log,
        resultId,
        details: formatLogDetails(log.details),
      }))
    )

  return session
}
