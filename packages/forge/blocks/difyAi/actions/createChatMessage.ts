import { createAction, option } from '@typebot.io/forge'
import { isDefined, isEmpty } from '@typebot.io/lib'
import { got } from 'got'
import { auth } from '../auth'
import { DifyResponse } from '../types'
import { defaultBaseUrl } from '../constants'

export const createChatMessage = createAction({
  auth,
  name: 'Create Chat Message',
  options: option.object({
    query: option.string.layout({
      label: 'Query',
      placeholder: 'User input/question content',
      inputType: 'textarea',
      isRequired: true,
    }),
    conversation_id: option.string.layout({
      label: 'Conversation ID',
      moreInfoTooltip:
        'Used to remember the conversation with the user. If empty, a new conversation id is created.',
    }),
    user: option.string.layout({
      label: 'User',
      moreInfoTooltip:
        'The user identifier, defined by the developer, must ensure uniqueness within the app.',
    }),
    inputs: option.keyValueList.layout({
      accordion: 'Inputs',
    }),
    responseMapping: option
      .saveResponseArray(['Answer', 'Conversation ID', 'Total Tokens'])
      .layout({
        accordion: 'Save response',
      }),
  }),
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((r) => r.variableId).filter(isDefined) ?? [],
  run: {
    server: async ({
      credentials: { apiEndpoint, apiKey },
      options: { conversation_id, query, user, inputs, responseMapping },
      variables,
    }) => {
      const res: DifyResponse = await got
        .post((apiEndpoint ?? defaultBaseUrl) + '/v1/chat-messages', {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          json: {
            inputs: inputs?.reduce((acc, { key, value }) => {
              if (isEmpty(key) || isEmpty(value)) return acc
              return {
                ...acc,
                [key]: value,
              }
            }, {}),
            query,
            response_mode: 'blocking',
            conversation_id,
            user,
          },
        })
        .json()

      responseMapping?.forEach((mapping) => {
        if (!mapping.variableId) return

        const item = mapping.item ?? 'Answer'
        if (item === 'Answer') variables.set(mapping.variableId, res.answer)

        if (item === 'Conversation ID')
          variables.set(mapping.variableId, res.conversation_id)

        if (item === 'Total Tokens')
          variables.set(mapping.variableId, res.metadata.usage.total_tokens)
      })
    },
  },
})
