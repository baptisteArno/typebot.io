import { AuthDefinition, option } from '@typebot.io/forge'

export const auth = {
  type: 'encryptedCredentials',
  name: 'Zemantic AI account',
  schema: option.object({
    apiKey: option.string.layout({
      label: 'API key',
      isRequired: true,
      placeholder: 'ze...',
      inputType: 'password',
      helperText:
        'You can generate an API key [here](https://zemantic.ai/dashboard/settings).',
      isDebounceDisabled: true,
    }),
  }),
} satisfies AuthDefinition
