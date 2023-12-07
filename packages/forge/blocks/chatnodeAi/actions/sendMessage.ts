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
      label: 'BotId',
      placeholder: 'Content',
      moreInfoTooltip:
        'The bot_id you want to ask question to',
    }),
    query: option.string.layout({
      label: 'query',
      placeholder: 'Content',
      moreInfoTooltip:
        'The query you want to ask your chatbot',
    }),
    responseMapping: option
      .saveResponseArray([
        'message', 'chat_session_id'
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

        if (mapping.item === 'message')
          variables.set(
            mapping.variableId,
              res.message
          )
        console.log(variables.get(mapping.variableId))

         if (mapping.item === 'chat_session_id')
          variables.set(
            mapping.variableId,
            res.chat_session_id
          )

      })
    },
  },
})
