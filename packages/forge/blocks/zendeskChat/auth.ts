import { option, AuthDefinition } from '@typebot.io/forge'

export const auth = {
  type: 'encryptedCredentials',
  name: 'Zendesk Messaging account',
  schema: option.object({
    secretKey: option.string.layout({
      label: 'Secret Key',
      isRequired: true,
      inputType: 'password',
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
    keyId: option.string.layout({
      label: 'Key ID',
      isRequired: true,
      withVariableButton: false,
      isDebounceDisabled: true,
    })
  }),
} satisfies AuthDefinition
