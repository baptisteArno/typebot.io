import { TRPCError } from '@trpc/server'
import { SessionState } from '@typebot.io/schemas'

export const getFirstEdgeId = ({
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
