import { createAuth, option } from '@typebot.io/forge'

export const auth = createAuth({
  type: 'encryptedCredentials',
  name: 'OpenAI account',
  schema: option.object({
    apiKey: option.string.layout({
      isRequired: true,
      label: 'API key',
      placeholder: 'sk-...',
      inputType: 'password',
      helperText:
        'You can generate an API key [here](https://platform.openai.com/account/api-keys)',
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
    baseUrl: option.string.layout({
      label: 'Base URL',
      defaultValue: 'https://api.openai.com/v1',
      moreInfoTooltip:
        'Use a different URL prefix for API calls, e.g. to use proxy servers.',
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
  }),
})
