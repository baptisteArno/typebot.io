import { option, AuthDefinition } from '@typebot.io/forge'

export const auth = {
  type: 'encryptedCredentials',
  name: 'Zendesk Conversations API',
  schema: option.object({
    conversationsSecretKey: option.string.layout({
      label: 'Conversations Secret Key',
      isRequired: true,
      inputType: 'password',
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
    conversationsKeyId: option.string.layout({
      label: 'Conversations Key ID',
      isRequired: true,
      withVariableButton: false,
      isDebounceDisabled: true,
      helperText:
        '[How to find my Zendesk Key ID and Secret Key?](https://docs.typebot.io/editor/blocks/integrations/zendesk#how-to-find-my-zendesk-key-id-and-secret-key)',
    }),
  }),
} satisfies AuthDefinition
