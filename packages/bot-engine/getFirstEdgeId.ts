import { TRPCError } from '@trpc/server'
import { SniperInSession } from '@sniper.io/schemas'

export const getFirstEdgeId = ({
  sniper,
  startEventId,
}: {
  sniper: Pick<SniperInSession, 'events' | 'groups' | 'version'>
  startEventId: string | undefined
}) => {
  if (startEventId) {
    const event = sniper.events?.find((e) => e.id === startEventId)
    if (!event)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "Start event doesn't exist",
      })
    return event.outgoingEdgeId
  }
  if (sniper.version === '6') return sniper.events?.[0].outgoingEdgeId
  return sniper.groups.at(0)?.blocks.at(0)?.outgoingEdgeId
}
