import { createAction, option } from '@typebot.io/forge'
import { createClaudiaResponseLog } from '../helpers/createClaudiaResponseLog'

export const endFLow = createAction({
  name: 'End Flow [N1]',
  run: {
    server: ({ logs }) => {
      const log = createClaudiaResponseLog({
        action: 'END_FLOW',
      })
      logs.add(log)
    },
  },
})
