import { TRPCError } from '@trpc/server'
import { ChatReply, SessionState, StartElementId } from '@typebot.io/schemas'
import { executeGroup } from './executeGroup'
import { getNextGroup } from './getNextGroup'
import { VisitedEdge } from '@typebot.io/prisma'

type Props = {
  version: 1 | 2
  state: SessionState
} & StartElementId

export const startBotFlow = async ({
  version,
  state,
  ...props
}: Props): Promise<
  ChatReply & { newSessionState: SessionState; visitedEdges: VisitedEdge[] }
> => {
  let newSessionState = state
  const visitedEdges: VisitedEdge[] = []
  if ('startGroupId' in props) {
    const group = state.typebotsQueue[0].typebot.groups.find(
      (group) => group.id === props.startGroupId
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
    })
  }
  const firstEdgeId = getFirstEdgeId({
    state: newSessionState,
    startEventId: 'startEventId' in props ? props.startEventId : undefined,
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
  })
}

const getFirstEdgeId = ({
  state,
  startEventId,
}: {
  state: SessionState
  startEventId: string | undefined
}) => {
  const { typebot } = state.typebotsQueue[0]
  if (startEventId) {
    const event = typebot.events?.find((e) => e.id === startEventId)
    if (!event)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "Start event doesn't exist",
      })
    return event.outgoingEdgeId
  }
  if (typebot.version === '6') return typebot.events[0].outgoingEdgeId
  return typebot.groups[0].blocks[0].outgoingEdgeId
}
