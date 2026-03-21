import { createAuth, option } from '@typebot.io/forge'

export const auth = createAuth({
  type: 'encryptedCredentials',
  name: 'Google Places Autocomplete account',
  schema: option.object({
    apiKey: option.string.meta({
      layout: {
        label: 'API key',
        isRequired: true,
        inputType: 'password',
        helperText:
          'You can generate an API key [here](https://console.cloud.google.com/apis/credentials). Make sure to enable the **Places API** and **Maps JavaScript API**.',
        withVariableButton: false,
        isDebounceDisabled: true,
      },
    }),
  }),
})
