import { option, AuthDefinition } from '@typebot.io/forge'

export const auth = {
  type: 'encryptedCredentials',
  name: 'Zendesk Messaging account',
  schema: option.object({
    secretKey: option.string.layout({
      label: 'Secret key',
      isRequired: true,
      inputType: 'password',
      moreInfoTooltip: 'Learn more here: https://developer.zendesk.com/documentation/zendesk-web-widget-sdks/sdks/web/enabling_auth_visitors/#generating-a-signing-key.',
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
    keyId: option.string.layout({
      label: 'Key ID',
      isRequired: true,
      inputType: 'textarea',
      moreInfoTooltip: 'Learn more here: https://developer.zendesk.com/documentation/zendesk-web-widget-sdks/sdks/web/enabling_auth_visitors/#generating-a-signing-key.',
      withVariableButton: false,
      isDebounceDisabled: true,
    })
  }),
} satisfies AuthDefinition
