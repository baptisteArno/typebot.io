import { option, AuthDefinition } from '@typebot.io/forge'

export const auth = {
  type: 'encryptedCredentials',
  name: 'Me Chama No Zap account',
  schema: option.object({
    token: option.string.layout({
      label: 'Token',
      inputType: 'password',
      isRequired: true,
      helperText:
        'Obtenha o token no nosso [portal de atendimento](https://atendimento.mechamanozap.net/)  > Configurações do Perfil > Token de Acesso',
    }),
    accountID: option.string.layout({
      label: 'Account ID',
      isRequired: true,
      helperText:
        'Obtenha o token no nosso [portal de atendimento](https://atendimento.mechamanozap.net/)  > Configurações do Perfil: é o primeiro numero que aparece na URL, no exemplo a seguir é 456: https://atendimento.mechamanozap.net/app/accounts/456/settings/general',
    }),
  }),
} satisfies AuthDefinition
