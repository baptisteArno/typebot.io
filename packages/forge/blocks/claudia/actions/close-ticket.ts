import { createAction } from '@typebot.io/forge'
import { createClaudiaResponseLog } from '../helpers/createClaudiaResponseLog'

export const closeTicket = createAction({
  name: 'Close Ticket [N1]',
  run: {
    server: ({ logs }) => {
      const log = createClaudiaResponseLog({
        action: 'CLOSE_TICKET',
      })
      logs.add(log)
    },
  },
})
