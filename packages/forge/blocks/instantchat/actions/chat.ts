import { createAction, option } from '@typebot.io/forge'
import { isDefined } from '@typebot.io/lib'
import { baseOptions } from '../baseOptions'
import { auth } from '../auth'

export const chat = createAction({
  auth,
  name: 'Infos',
  baseOptions,
  options: option.object({
    uniqueId: option.string.layout({
      label: 'Unique ID',
      moreInfoTooltip:
        'Informe o protocolo do atendimento do qual deseja informações.',
    }),
    responseMapping: option
      .saveResponseArray([
        'Identificador do Cliente',
        'Data e Hora',
        'Unique ID',
        'Plataforma',
        'Dado Adicional 1 (chave)',
        'Dado Adicional 1 (valor)',
        'Dado Adicional 2 (chave)',
        'Dado Adicional 2 (valor)',
        'Mensagens',
        'Nome do Agente',
        'Fila do Agente',
        'Email do Agente',
        'Nome do cliente',
        'Telefone do cliente',
        'Código do cliente',
        'Email do cliente',
        'Empresa do cliente',
        'CPF/CNPJ do cliente',
      ] as const)
      .layout({
        accordion: 'Salvar resultado',
      }),
  }),
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((r) => r.variableId).filter(isDefined) ?? [],
  run: {
    server: async ({
      options: { uniqueId, responseMapping },
      variables,
      credentials,
    }) => {
      const { baseUrl } = credentials
      const id_chatbot = variables
        .list()
        .find((v) => v.name === 'is_chatbotid')?.value
      const id_cliente = variables
        .list()
        .find((v) => v.name === 'is_clientid')?.value
      const url = `${baseUrl}/ivci/webhook/get_chat?unique_id=${uniqueId}&page_id=${id_chatbot}&sender_id=${id_cliente}`
      const response = await fetch(url, { method: 'POST' })
      if (response.status < 300 && response.status >= 200) {
        const res = await response.json()
        responseMapping?.forEach((r) => {
          if (!r.variableId) return
          const item = r.item ?? 'Identificador do Cliente'
          switch (item) {
            case 'Identificador do Cliente':
              variables.set(r.variableId, res.Chat?.nick)
              break
            case 'Data e Hora':
              variables.set(r.variableId, res.Chat?.time)
              break
            case 'Dado Adicional 1 (chave)':
              variables.set(r.variableId, res.Chat?.custom_field2_title)
              break
            case 'Dado Adicional 1 (valor)':
              variables.set(r.variableId, res.Chat?.custom_field2_value)
              break
            case 'Dado Adicional 2 (chave)':
              variables.set(r.variableId, res.Chat?.custom_field3_title)
              break
            case 'Dado Adicional 2 (valor)':
              variables.set(r.variableId, res.Chat?.custom_field3_value)
              break
            case 'Unique ID':
              variables.set(r.variableId, res.Chat?.uniqueid)
              break
            case 'Plataforma':
              variables.set(r.variableId, res.Chat?.platform)
              break
            case 'Mensagens':
              variables.set(r.variableId, res.Chat?.messages)
              break
            case 'Nome do Agente':
              variables.set(r.variableId, res.Chat?.agent_name)
              break
            case 'Fila do Agente':
              variables.set(r.variableId, res.Chat?.agent_queue)
              break
            case 'Email do Agente':
              variables.set(r.variableId, res.Chat?.agent_email)
              break
            case 'Nome do cliente':
              variables.set(r.variableId, res.Client?.name)
              break
            case 'Telefone do cliente':
              variables.set(r.variableId, res.Client?.telephone)
              break
            case 'Código do cliente':
              variables.set(r.variableId, res.Client?.customer_code)
              break
            case 'Email do cliente':
              variables.set(r.variableId, res.Client?.email)
              break
            case 'Empresa do cliente':
              variables.set(r.variableId, res.Client?.enterprise_name)
              break
            case 'CPF/CNPJ do cliente':
              variables.set(r.variableId, res.Client?.enterprise_cnpj)
              break
            default:
              break
          }
        })
      }
    },
  },
})
