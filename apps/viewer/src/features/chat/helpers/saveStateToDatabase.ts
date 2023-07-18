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

  if (!state?.result?.id) return session

  const containsSetVariableClientSideAction = clientSideActions?.some(
    (action) => 'setVariable' in action
  )
  await upsertResult({
    state,
    isCompleted: Boolean(
      !input &&
        !containsSetVariableClientSideAction &&
        state.result.answers.length > 0
    ),
  })

  if (logs && logs.length > 0)
    await saveLogs(
      logs.map((log) => ({
        ...log,
        resultId: state.result.id as string,
        details: formatLogDetails(log.details),
      }))
    )

  return session
}
