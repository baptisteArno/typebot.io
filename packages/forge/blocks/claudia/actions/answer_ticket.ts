import { createAction, option } from '@typebot.io/forge'
import { createClaudiaResponseLog } from '../helpers/createClaudiaResponseLog'

export const answerTicket = createAction({
  name: 'Answer Ticket [N1]',
  run: {
    server: ({ logs, options }) => {
      const log = createClaudiaResponseLog({
        action: 'ANSWER_TICKET',
        topic: options.topic,
      })
      logs.add(log)
    },
  },
  options: option.object({
    topic: option.string.layout({
      label: 'Topic',
      placeholder: 'e.g. PAYMENT',
      accordion: 'Advanced settings',
    }),
  }),
})
