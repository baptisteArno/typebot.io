import { createAction } from '@typebot.io/forge'
import { createClaudiaResponseLog } from '../helpers/createClaudiaResponseLog'

export const forwardToHuman = createAction({
  name: 'Forward to Human [N2]',
  run: {
    server: ({ logs }) => {
      const log = createClaudiaResponseLog({
        action: 'FORWARD_TO_HUMAN',
      })
      logs.add(log)
    },
  },
})
