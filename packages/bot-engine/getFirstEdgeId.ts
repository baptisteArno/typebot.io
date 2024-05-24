import { TRPCError } from '@trpc/server'
import { TypebotInSession } from '@typebot.io/schemas'

export const getFirstEdgeId = ({
  typebot,
  startEventId,
}: {
  typebot: Pick<TypebotInSession, 'events' | 'groups' | 'version'>
  startEventId: string | undefined
}) => {
  if (startEventId) {
    const event = typebot.events?.find((e) => e.id === startEventId)
    if (!event)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "Start event doesn't exist",
      })
    return event.outgoingEdgeId
  }
  if (typebot.version === '6') return typebot.events?.[0].outgoingEdgeId
  return typebot.groups.at(0)?.blocks.at(0)?.outgoingEdgeId
}
