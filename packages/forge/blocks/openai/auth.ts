import { createAuth, option } from '@typebot.io/forge'

export const auth = createAuth({
  type: 'encryptedCredentials',
  name: 'OpenAI account',
  schema: option.object({
    apiKey: option.string.layout({
      isRequired: true,
      label: 'API key',
      placeholder: 'sk-...',
      helperText:
        'You can generate an API key [here](https://platform.openai.com/account/api-keys)',
      withVariableButton: false,
    }),
  }),
})
