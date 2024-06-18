import { StartEventNode } from '@/features/events/start/StartEventNode'
import { TEvent } from '@sniper.io/schemas'

type Props = {
  event: TEvent
}
export const EventNodeContent = ({ event }: Props) => {
  switch (event.type) {
    case 'start':
      return <StartEventNode />
    default:
      return null
  }
}
