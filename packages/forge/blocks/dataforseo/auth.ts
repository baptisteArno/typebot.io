import { option, AuthDefinition } from '@typebot.io/forge'

export const auth = {
  type: 'encryptedCredentials',
  name: 'DataForSEO Account',
  schema: option.object({
    apiLogin: option.string.layout({
      label: 'API login',
      isRequired: true,
    }),

    apiKey: option.string.layout({
      label: 'API password',
      isRequired: true,
      inputType: 'password',
      helperText:
        'You can read an API key in [your API access page](https://app.dataforseo.com/api-settings/api-access).',
    }),

    sandbox: option.boolean.layout({
      label: 'Sandbox',
      helperText: 'Enable this option to use the sandbox environment.',
    }),
  }),
} satisfies AuthDefinition
