import { createAction, option } from '@typebot.io/forge'
import { isDefined } from '@typebot.io/lib'
import { baseOptions } from '../baseOptions'
import { auth } from '../auth'

export const checkTime = createAction({
  auth,
  name: 'Horário',
  baseOptions,
  options: option.object({
    checktime: option.string.layout({
      label: 'Horário',
      moreInfoTooltip:
        'Informe o nome do ckecktime ou escolha a variável que contém essa informação.',
      fetcher: 'fetchChecktimes',
    }),
    responseMapping: option.saveResponseArray(['Resultado']).layout({
      accordion: 'Salvar resultado',
    }),
  }),
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((r) => r.variableId).filter(isDefined) ?? [],
  run: {
    server: async ({
      credentials,
      options: { checktime, responseMapping },
      variables,
    }) => {
      const { baseUrl } = credentials

      const accountcode = variables
        .list()
        .find((v) => v.name === 'is_accountcode')?.value

      let result = false
      if (accountcode && checktime) {
        const params = new URLSearchParams({
          accountcode: accountcode.toString(),
          checktime: checktime,
        })
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

        const url = `${baseUrl}/ivci/webhook/checktime?${params.toString()}`
        const response = await fetch(url, { method: 'POST' })
        if (response.status < 300 && response.status >= 200) {
          const res = await response.json()
          result = res.Checktime
        }
      }

      responseMapping?.forEach((r) => {
        if (!r.variableId) return
        if (!r.item || r.item === 'Resultado') {
          variables.set(r.variableId, result)
        }
      })
    },
  },
  fetchers: [
    {
      id: 'fetchChecktimes',
      dependencies: ['baseUrl', 'accountcode'],
      fetch: async ({ credentials, options }) => {
        const { baseUrl, accountcode } = options

        if (baseUrl && accountcode) {
          const url = `${baseUrl}/ivci/webhook/checktime/${accountcode}`
          const response = await fetch(url, { method: 'GET' })
          if (response.status < 300 && response.status >= 200) {
            const res = await response.json()
            return res
          }
        }
        return []
      },
    },
  ],
})
