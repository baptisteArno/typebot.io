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
      .array(option.string.layout({ placeholder: 'Type a name...' }))
      .layout({
        label: 'Intenções',
        itemLabel: 'intenção',
      }),
    descriptions: option
      .array(option.string.layout({ placeholder: 'Type a name...' }))
      .layout({
        label: 'Descrições',
        itemLabel: 'descrição',
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
      const { intents, descriptions, question, responseMapping } = options
      let { cortexToken, baseUrl, cortexUrl } = credentials

      if (!intents || !descriptions || !question) {
        console.log('Missing intents and descriptions.')
        return
      }

      const l = Math.min(intents.length, descriptions.length)
      const intentList = []
      for (let i = 0; i < l; i++) {
        intentList.push({
          name: intents[i],
          description: descriptions[i],
        })
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
