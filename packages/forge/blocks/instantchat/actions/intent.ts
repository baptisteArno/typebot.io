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
      helperText:
          'As intenções deve estar no formato: \n\nnome: descrição.\n\nExemplo:\n\n comercial: Útil quando o cliente deseja falar com a equipe comercial.',
    }),
    intents: option
      .array(
        option.object({
          intent: option.string.layout({
            label: 'Intenção',
            placeholder: 'Nome: descrição',
            moreInfoTooltip:
                'As intenções deve estar no formato: \n\nnome: descrição.\n\nExemplo:\n\n comercial: Útil quando o cliente deseja falar com a equipe comercial.',
          }),
        })
      )
      .layout({
        accordion: 'Intenções',
        label: 'Intenções',
        itemLabel: 'intenção',
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
          const x = intents[i]['intent']!.split(':', 2)
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
