import { TRPCError } from '@trpc/server'
import { ChatReply, SessionState } from '@typebot.io/schemas'
import { executeGroup } from './executeGroup'
import { getNextGroup } from './getNextGroup'

export const startBotFlow = async (
  state: SessionState,
  startGroupId?: string
): Promise<ChatReply & { newSessionState: SessionState }> => {
  if (startGroupId) {
    const group = state.typebotsQueue[0].typebot.groups.find(
      (group) => group.id === startGroupId
    )
    if (!group)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "startGroupId doesn't exist",
      })
    return executeGroup(state)(group)
  }
  const firstEdgeId =
    state.typebotsQueue[0].typebot.groups[0].blocks[0].outgoingEdgeId
  if (!firstEdgeId) return { messages: [], newSessionState: state }
  const nextGroup = await getNextGroup(state)(firstEdgeId)
  if (!nextGroup.group) return { messages: [], newSessionState: state }
  return executeGroup(state)(nextGroup.group)
}
