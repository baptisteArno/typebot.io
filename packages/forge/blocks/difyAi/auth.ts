import { option, AuthDefinition } from '@typebot.io/forge'

export const auth = {
  type: 'encryptedCredentials',
  name: 'Dify.AI account',
  schema: option.object({
    apiEndpoint: option.string.layout({
      label: 'API Endpoint',
      isRequired: true,
      helperText: 'URI where the Service API is hosted.',
      withVariableButton: false,
    }),
    apiKey: option.string.layout({
      label: 'App API key',
      isRequired: true,
      helperText: 'API Secret Key for your Dify App.',
      inputType: 'password',
      withVariableButton: false,
    }),
  }),
} satisfies AuthDefinition
