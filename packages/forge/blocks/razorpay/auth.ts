import { option, AuthDefinition } from '@typebot.io/forge'

export const auth = {
  type: 'encryptedCredentials',
  name: 'Razorpay account',
  schema: option.object({
    keySecret: option.string.layout({
      label: 'Key Secret',
      isRequired: true,
      helperText: 'You can generate an API key and secret [here](https://dashboard.razorpay.com/app/api-keys).',
    }),
  }),
} satisfies AuthDefinition
