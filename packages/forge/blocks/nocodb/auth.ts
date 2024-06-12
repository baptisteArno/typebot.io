import { option, AuthDefinition } from '@typebot.io/forge'
import { defaultBaseUrl } from './constants'

export const auth = {
  type: 'encryptedCredentials',
  name: 'NocoDB account',
  schema: option.object({
    baseUrl: option.string.layout({
      label: 'Base URL',
      isRequired: true,
      helperText: 'Change it only if you are self-hosting NocoDB.',
      withVariableButton: false,
      defaultValue: defaultBaseUrl,
    }),
    apiKey: option.string.layout({
      label: 'API Token',
      isRequired: true,
      helperText:
        'You can generate an API token [here](https://app.nocodb.com/#/account/tokens)',
      inputType: 'password',
      withVariableButton: false,
    }),
  }),
} satisfies AuthDefinition
