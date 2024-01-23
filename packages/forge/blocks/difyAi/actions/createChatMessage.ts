import { createAction, option } from '@typebot.io/forge'
import { isDefined, isEmpty } from '@typebot.io/lib'
import { got } from 'got'
import { auth } from '../auth'
import { DifyResponse } from '../types'

export const createChatMessage = createAction({
  auth,
  name: 'Create Chat Message',
  options: option.object({
    inputs: option.string.layout({
      label: 'Inputs',
      helperText:
        'Variable values to be replaced in the prompt. The code must be a JSON object containing the variable key/value pairs.',
      inputType: 'code',
      defaultValue: '{}',
    }),
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
      if (isEmpty(inputs)) inputs = '{}'

      const res: DifyResponse = await got
        .post(apiEndpoint + '/chat-messages', {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          json: {
            inputs: JSON.parse(inputs),
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
