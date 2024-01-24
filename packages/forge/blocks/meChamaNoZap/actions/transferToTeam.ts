import { createAction, option } from '@typebot.io/forge'
import { got } from 'got'
import { ATENDIMENTO_URL } from '..'
import { auth } from '../auth'
import { baseOptions } from '../baseOptions'

export const transferToTeam = createAction({
  auth,
  name: 'Transferir para time',
  options: option.object({
    team_id: option.string.layout({
      label: 'Team ID',
      isRequired: true,
      helperText:
        'Variavel com o ID do time, Obtenha o token no nosso [portal de atendimento](https://atendimento.mechamanozap.net/)  > Configurações > Time > Selecione o time : é o primeiro numero que aparece na URL, no exemplo a seguir é 996: https://atendimento.mechamanozap.net/app/accounts/456/settings/teams/996/edit',
    }),
  }),
  baseOptions,
  run: {
    server: async ({
      credentials: { token, accountID },
      options: { team_id, conversationId },
    }) => {
      const options = {
        headers: {
          api_access_token: token,
        },
        json: {
          team_id: team_id,
        },
      }
      let result = await got
        .post(
          `${ATENDIMENTO_URL}/api/v1/accounts/${accountID}/conversations/${conversationId}/assignments`,
          options
        )
        .json()
    },
  },
})
