import { createAction, option } from '@typebot.io/forge'
import { isDefined } from '@typebot.io/lib'
import { got } from 'got'
import { apiBaseUrl } from '../constants'
import { auth } from '../auth'
import { baseOptions } from '../baseOptions'
import { ChatNodeAiResponse } from '../types'

export const sendMessage = createAction({
  baseOptions,
  auth,
  name: 'Send Message',
  options: option.object({
    botId: option.string.layout({
      label: 'Bot ID',
      placeholder: '68c052c5c3680f63',
      moreInfoTooltip:
        'The bot_id you want to ask question to. You can find it at the end of your ChatBot URl in your dashboard',
    }),
    query: option.string.layout({
      label: 'Prompt',
      placeholder: 'Hi, what can I do with ChatNode',
      moreInfoTooltip:
        'The prompt you want to ask your chatbot',
    }),
    responseMapping: option
      .saveResponseArray([
        'Message', 'Thread ID'
      ])
      .layout({
        accordion: 'Save response',
      }),
  }),
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((r) => r.variableId).filter(isDefined) ?? [],
  run: {
    server: async ({
      credentials: { apiKey },
      options: {
        botId,
        query,
        responseMapping,
      },
      variables,
    }) => {
      const res: ChatNodeAiResponse = await got
        .post(apiBaseUrl + botId, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          json: {
            message: query
          },
        })
        .json()

      responseMapping?.forEach((mapping) => {

        if (!mapping.variableId || !mapping.item) return

        if (mapping.item === 'Message')
          variables.set(
            mapping.variableId,
              res.message
          )
        console.log(variables.get(mapping.variableId))

         if (mapping.item === 'Thread ID')
          variables.set(
            mapping.variableId,
            res.chat_session_id
          )

      })
    },
  },
})
