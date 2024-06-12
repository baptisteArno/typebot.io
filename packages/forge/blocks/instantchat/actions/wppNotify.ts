import { createAction, option } from '@typebot.io/forge'
import { VariableStore } from '@typebot.io/forge'
import { fetchQueues } from '../fetchers/fetchQueues'
import { fetchTemplates } from '../fetchers/fetchTemplates'
import { fetchSenders } from '../fetchers/fetchSenders'
import { fetchUserEmails } from '../fetchers/fetchUserEmails'

const orderTplParams = function (variables: VariableStore) {
  let params: string[] = []
  variables
    .list()
    .filter((v) => v.name.startsWith('TPL_'))
    .forEach((v) => {
      const [_, idx] = v.name.split('_')
      if (Number.isNaN(Number(idx))) return
      params[Number(idx)] = v.value as string
    })
  return params.filter((p) => p)
}

const getHeaderUrl = function (templateObj: any, variables: VariableStore) {
  let varUrl = variables.list().find((v) => v.name === 'HEADER_URL')?.value
  if (varUrl) return varUrl

  if (templateObj.headerImage) {
    return templateObj.headerImage
  }

  return null
}

export const KWIKAPI_TOKEN = '@kwikapi-token'
export const KWIKAPI_ADMIN_TOKEN = '@kwikapi-admin-token'

export const SESSION = ''
export const getToken = () => sessionStorage.getItem(KWIKAPI_TOKEN)
export const getAdminToken = () => sessionStorage.getItem(KWIKAPI_ADMIN_TOKEN)

export const wppNotify = createAction({
  name: 'WhatsApp Notify',
  options: option.object({
    from: option.string.layout({
      label: 'From',
      isRequired: true,
      fetcher: 'fetchSenders',
    }),
    to: option.string.layout({
      label: 'To',
      isRequired: true,
    }),
    queue: option.string.layout({
      label: 'Queue ID',
      fetcher: 'fetchQueues',
      moreInfoTooltip:
        'Informe o código da fila ou escolha a variável que contém essa informação.',
    }),
    templateData: option.string.layout({
      label: 'Template',
      isRequired: true,
      fetcher: 'fetchTemplates',
    }),
    agent: option.string.layout({
      label: 'Agent',
      fetcher: 'fetchUserEmails',
      isRequired: true,
    }),
  }),
  run: {
    server: async ({
      options: { from, to, queue, templateData, agent },
      variables,
      credentials,
    }) => {
      if (queue && to && from && templateData && agent) {
        const { baseUrl, kwikToken } = credentials
        const body = orderTplParams(variables)
        const templateObj = JSON.parse(templateData)
        const template = templateObj.name
        const headerURL = getHeaderUrl(templateObj, variables)
        const url = `${baseUrl}/api/api/public/v1/notification/`
        const formData = {
          queue_name: queue,
          from,
          to,
          template,
          agent_email: agent,
          body,
          headerURL,
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Token ${kwikToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
        if (response.status < 300 && response.status >= 200) {
          const res = await response.text()
        }
      }
    },
  },
  fetchers: [fetchQueues, fetchUserEmails, fetchTemplates, fetchSenders],
})
