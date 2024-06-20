import { option, AuthDefinition } from '@sniper.io/forge'

export const auth = {
  type: 'encryptedCredentials',
  name: 'ChatNode account',
  schema: option.object({
    apiKey: option.string.layout({
      label: 'API key',
      isRequired: true,
      helperText:
        'You can generate an API key [here](https://go.chatnode.ai/sniper).',
      inputType: 'password',
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
  }),
} satisfies AuthDefinition
