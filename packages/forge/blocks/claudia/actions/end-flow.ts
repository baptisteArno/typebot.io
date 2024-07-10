import { createAction, option } from '@typebot.io/forge'
import { createClaudiaResponseLog } from '../helpers/createClaudiaResponseLog'

export const endFLow = createAction({
  name: 'End Flow [N1]',
  run: {
    server: ({ logs, options }) => {
      const log = createClaudiaResponseLog({
        action: 'END_FLOW',
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
