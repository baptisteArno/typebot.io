import { TRPCError } from '@trpc/server'
import {
  ContinueChatResponse,
  SessionState,
  StartFrom,
} from '@typebot.io/schemas'
import { executeGroup } from './executeGroup'
import { getNextGroup } from './getNextGroup'
import { VisitedEdge } from '@typebot.io/prisma'
import { getFirstEdgeId } from './getFirstEdgeId'

type Props = {
  version: 1 | 2
  state: SessionState
  startFrom?: StartFrom
  startTime?: number
}

export const startBotFlow = async ({
  version,
  state,
  startFrom,
  startTime,
}: Props): Promise<
  ContinueChatResponse & {
    newSessionState: SessionState
    visitedEdges: VisitedEdge[]
  }
> => {
  let newSessionState = state
  const visitedEdges: VisitedEdge[] = []
  if (startFrom?.type === 'group') {
    const group = state.typebotsQueue[0].typebot.groups.find(
      (group) => group.id === startFrom.groupId
    )
    if (!group)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "Start group doesn't exist",
      })
    return executeGroup(group, {
      version,
      state: newSessionState,
      visitedEdges,
      startTime,
    })
  }
  const firstEdgeId = getFirstEdgeId({
    state: newSessionState,
    startEventId: startFrom?.type === 'event' ? startFrom.eventId : undefined,
  })
  if (!firstEdgeId) return { messages: [], newSessionState, visitedEdges: [] }
  const nextGroup = await getNextGroup(newSessionState)(firstEdgeId)
  newSessionState = nextGroup.newSessionState
  if (nextGroup.visitedEdge) visitedEdges.push(nextGroup.visitedEdge)
  if (!nextGroup.group) return { messages: [], newSessionState, visitedEdges }
  return executeGroup(nextGroup.group, {
    version,
    state: newSessionState,
    visitedEdges,
    startTime,
  })
}
