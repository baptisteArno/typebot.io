import { createAction, option } from '@typebot.io/forge'
import { Analytics } from '@segment/analytics-node'
import { auth } from '../auth'

export const identify = createAction({
  auth,
  name: 'Identify User',
  options: option.object({
    userId: option.string.layout({
      label: 'User ID',
      isRequired: true,
    }),
    email: option.string.layout({
      label: 'Email',
      isRequired: false,
    }),
    traits: option.array(option.object({
      key: option.string.layout({
        label: 'Key',
        isRequired: true,
      }),
      value: option.string.layout({
        label: 'Value',
        isRequired: true,
      }),
    })).layout({
      itemLabel: 'trait',
    }),
  }),
  run: {
    server: async ({
      credentials: { apiKey },
      options: { userId, email, traits },
    }) => {
      if (!email || email.length === 0
        || !userId || userId.length === 0
        || apiKey === undefined) return

      const analytics = new Analytics({ writeKey: apiKey })

      if (traits === undefined || traits.length === 0) {
        analytics.identify({
          userId: userId,
          traits: {
            email: email
          }
        })
      } else {
        analytics.identify({
          userId: userId,
          traits: createTraits(traits, email)
        })
      }
      await analytics.closeAndFlush()
    }
  },
})

const createTraits = (traits: { key?: string; value?: string }[], email: string) => {
  const _traits: Record<string, any> = {}

  // add email as a default trait
  traits.push({ key: 'email', value: email })

  traits.forEach(({ key, value }) => {
    if (!key || !value) return
    _traits[key] = value
  })

  return _traits
}
