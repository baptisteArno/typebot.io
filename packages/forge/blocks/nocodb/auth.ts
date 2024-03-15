import { option, AuthDefinition } from '@typebot.io/forge'

export const auth = {
  type: 'encryptedCredentials',
  name: 'NocoDB account',
  schema: option.object({
    apiEndpoint: option.string.layout({
      label: 'API Endpoint',
      isRequired: true,
      helperText: 'URI where the Service API is hosted.',
      withVariableButton: false,
    }),
    apiKey: option.string.layout({
      label: 'API Token key',
      isRequired: true,
      helperText: 'API Secret Key for your NocoDB App.',
      inputType: 'password',
      withVariableButton: false,
    }),
  }),
} satisfies AuthDefinition
