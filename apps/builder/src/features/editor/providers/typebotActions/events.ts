import { produce } from 'immer'
import { TEvent } from '@sniper.io/schemas'
import { SetSniper } from '../SniperProvider'

export type EventsActions = {
  updateEvent: (
    eventIndex: number,
    updates: Partial<Omit<TEvent, 'id'>>
  ) => void
}

const eventsActions = (setSniper: SetSniper): EventsActions => ({
  updateEvent: (eventIndex: number, updates: Partial<Omit<TEvent, 'id'>>) =>
    setSniper((sniper) =>
      produce(sniper, (sniper) => {
        const event = sniper.events[eventIndex]
        sniper.events[eventIndex] = { ...event, ...updates }
      })
    ),
})

export { eventsActions }
