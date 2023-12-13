import { option, AuthDefinition } from '@typebot.io/forge'

export const auth = {
  type: 'encryptedCredentials',
  name: 'ChatNode account',
  schema: option.object({
    apiKey: option.string.layout({
      label: 'API key',
      isRequired: true,
      helperText:
        'You can generate an API key [here](https://www.chatnode.ai/account/settings).',
      input: 'password',
    }),
  }),
} satisfies AuthDefinition
