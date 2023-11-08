import { produce } from 'immer'
import { TEvent } from '@typebot.io/schemas'
import { SetTypebot } from '../TypebotProvider'

export type EventsActions = {
  updateEvent: (
    eventIndex: number,
    updates: Partial<Omit<TEvent, 'id'>>
  ) => void
}

const eventsActions = (setTypebot: SetTypebot): EventsActions => ({
  updateEvent: (eventIndex: number, updates: Partial<Omit<TEvent, 'id'>>) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const event = typebot.events[eventIndex]
        typebot.events[eventIndex] = { ...event, ...updates }
      })
    ),
})

export { eventsActions }
