import { createAction, option } from '@typebot.io/forge'
import { Analytics } from '@segment/analytics-node'
import { auth } from '../auth'

export const alias = createAction({
  auth,
  name: 'Alias',
  options: option.object({
    userId: option.string.layout({
      label: 'User ID',
      isRequired: true,
      moreInfoTooltip: 'New ID of the user.',
    }),
    previousId: option.string.layout({
      label: 'Previous ID',
      moreInfoTooltip: 'Previous ID of the user to alias.',
    }),
  }),
  run: {
    server: async ({
      credentials: { apiKey },
      options: { userId, previousId },
    }) => {
      if (!userId || userId.length === 0
        || !previousId || previousId.length === 0
        || apiKey === undefined) return

      const analytics = new Analytics({ writeKey: apiKey })

      analytics.alias({
        userId: userId,
        previousId: previousId
      })

      await analytics.closeAndFlush()
    }
  },
})
