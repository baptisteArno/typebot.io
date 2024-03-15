import { option, AuthDefinition } from '@typebot.io/forge'

export const auth = {
  type: 'encryptedCredentials',
  name: 'Anthropic account',
  schema: option.object({
    apiKey: option.string.layout({
      label: 'API key',
      isRequired: true,
      inputType: 'password',
      helperText:
        'You can generate an API key [here](https://console.anthropic.com/settings/keys).',
      placeholder: 'sk-...',
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
  }),
} satisfies AuthDefinition
