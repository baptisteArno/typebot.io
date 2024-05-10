import { createAction, option } from '@typebot.io/forge'
import { isDefined } from '@typebot.io/lib'
import { baseOptions } from '../baseOptions'
import { defaultCortexOptions } from '../constants'

export const intent = createAction({
  name: 'Detectar Intenção',
  baseOptions,
  options: option.object({
    question: option.string.layout({
      label: 'Pergunta',
    }),
    intents: option
      .array(
        option.string.layout({
          placeholder: 'Type a name...',
        })
      )
      .layout({
        label: 'Intenções',
        itemLabel: 'intenção',
        helperText:
          'As intenções deve estar no formato. \nnome: descrição.\n\nExemplo:\n comercial: Útil quando o cliente deseja falar com a equipe comercial.',
      }),
    responseMapping: option.string.layout({
      label: 'Salvar resultado',
      inputType: 'variableDropdown',
    }),
  }),
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping ? [responseMapping] : [],
  run: {
    server: async ({ credentials, options, variables }) => {
      const { intents, question, responseMapping } = options
      let { cortexToken, baseUrl, cortexUrl } = credentials

      if (!intents || !question) {
        console.log('Missing intents and descriptions.')
        return
      }

      const intentList = []
      for (let i = 0; i < intents.length; i++) {
        if (intents[i]) {
          const x = intents[i]!.split(':', 2)
          intentList.push({
            name: x[0],
            description: x[1],
          })
        }
      }

      if (!cortexToken || !baseUrl || !cortexUrl) {
        console.log('Missing cortex credentials.')
        return
      }

      const payload = {
        intents: intentList,
        question: question,
      }

      if (cortexUrl.endsWith('/')) {
        cortexUrl = cortexUrl.slice(0, -1)
      }

      const response = await fetch(`${cortexUrl}/ai/intent/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cortexToken}`,
        },
        body: JSON.stringify(payload),
      })

      if (response.status < 300 && response.status >= 200) {
        const ret = await response.json()

        if (responseMapping && ret) {
          variables.set(responseMapping, ret)
        }
      }
    },
  },
})
