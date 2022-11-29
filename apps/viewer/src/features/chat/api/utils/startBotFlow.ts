import { ChatReply, SessionState } from 'models'
import { executeGroup } from './executeGroup'
import { getNextGroup } from './getNextGroup'

export const startBotFlow = async (
  state: SessionState
): Promise<ChatReply & { newSessionState?: SessionState }> => {
  const firstEdgeId = state.typebot.groups[0].blocks[0].outgoingEdgeId
  if (!firstEdgeId) return { messages: [] }
  const nextGroup = getNextGroup(state)(firstEdgeId)
  if (!nextGroup) return { messages: [] }
  return executeGroup(state)(nextGroup.group)
}
