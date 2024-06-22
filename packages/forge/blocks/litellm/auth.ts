import { option, AuthDefinition } from '@typebot.io/forge'

export const auth = {
  type: 'encryptedCredentials',
  name: 'LiteLLM account',
  schema: option.object({
    apiKey: option.string.layout({
      label: 'API key',
      isRequired: true,
      inputType: 'password',
      withVariableButton: false,
      isDebounceDisabled: true,
    },
    ),
    baseURL: option.string.layout({
      label: 'Base URL',
      isRequired: true,
      isDebounceDisabled: true,
    }),
    apiVersion: option.string.layout({
      label: 'API version',
      isRequired: true,
      isDebounceDisabled: true,
    }),
  }),
} satisfies AuthDefinition
