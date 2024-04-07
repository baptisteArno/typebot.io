import { option, AuthDefinition } from '@typebot.io/forge'
import { defaultBaseUrl } from './constants'
import { isURL } from '@typebot.io/lib/validators/isURL'

const extractBaseUrl = (val: string | undefined) => {
  if (!val) return val
  const url = new URL(val)
  return url.origin
}

export const auth = {
  type: 'encryptedCredentials',
  name: 'Dify.AI assistant',
  schema: option.object({
    apiEndpoint: option.string
      .layout({
        label: 'API Endpoint',
        isRequired: true,
        helperText: 'URI where the Service API is hosted.',
        withVariableButton: false,
        defaultValue: defaultBaseUrl,
      })
      .refine((val) => !val || isURL(val))
      .transform(extractBaseUrl),
    apiKey: option.string.layout({
      label: 'App API key',
      isRequired: true,
      helperText: 'API Secret Key for your Dify App.',
      inputType: 'password',
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
  }),
} satisfies AuthDefinition
