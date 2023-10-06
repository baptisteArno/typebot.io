import { TRPCError } from '@trpc/server'
import { ChatReply, SessionState } from '@typebot.io/schemas'
import { executeGroup } from './executeGroup'
import { getNextGroup } from './getNextGroup'

type Props = {
  version: 1 | 2
  state: SessionState
  startGroupId?: string
}

export const startBotFlow = async ({
  version,
  state,
  startGroupId,
}: Props): Promise<ChatReply & { newSessionState: SessionState }> => {
  let newSessionState = state
  if (startGroupId) {
    const group = state.typebotsQueue[0].typebot.groups.find(
      (group) => group.id === startGroupId
    )
    if (!group)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "startGroupId doesn't exist",
      })
    return executeGroup(group, { version, state: newSessionState })
  }
  const firstEdgeId =
    newSessionState.typebotsQueue[0].typebot.groups[0].blocks[0].outgoingEdgeId
  if (!firstEdgeId) return { messages: [], newSessionState }
  const nextGroup = await getNextGroup(newSessionState)(firstEdgeId)
  newSessionState = nextGroup.newSessionState
  if (!nextGroup.group) return { messages: [], newSessionState }
  return executeGroup(nextGroup.group, { version, state: newSessionState })
}
