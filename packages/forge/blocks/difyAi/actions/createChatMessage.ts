import { createAction, option } from '@typebot.io/forge'
import { isDefined, isEmpty, isNotEmpty } from '@typebot.io/lib'
import { HTTPError, got } from 'got'
import { auth } from '../auth'
import { defaultBaseUrl } from '../constants'
import { Chunk } from '../types'

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
      .saveResponseArray(['Answer', 'Conversation ID', 'Total Tokens'] as const)
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
      logs,
    }) => {
      try {
        const stream = got.post(
          (apiEndpoint ?? defaultBaseUrl) + '/v1/chat-messages',
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
            json: {
              inputs:
                inputs?.reduce((acc, { key, value }) => {
                  if (isEmpty(key) || isEmpty(value)) return acc
                  return {
                    ...acc,
                    [key]: value,
                  }
                }, {}) ?? {},
              query,
              response_mode: 'streaming',
              conversation_id,
              user,
              files: [],
            },
            isStream: true,
          }
        )

        const { answer, conversationId, totalTokens } = await new Promise<{
          answer: string
          conversationId: string | undefined
          totalTokens: number | undefined
        }>((resolve, reject) => {
          let jsonChunk = ''
          let answer = ''
          let conversationId: string | undefined
          let totalTokens: number | undefined

          stream.on('data', (chunk) => {
            const lines = chunk.toString().split('\n') as string[]
            lines
              .filter((line) => line.length > 0 && line !== '\n')
              .forEach((line) => {
                jsonChunk += line
                if (jsonChunk.startsWith('event: ')) {
                  jsonChunk = ''
                  return
                }
                if (!jsonChunk.startsWith('data: ') || !jsonChunk.endsWith('}'))
                  return

                const data = JSON.parse(jsonChunk.slice(6)) as Chunk
                jsonChunk = ''
                if (
                  data.event === 'message' ||
                  data.event === 'agent_message'
                ) {
                  answer += data.answer
                }
                if (data.event === 'message_end') {
                  totalTokens = data.metadata.usage.total_tokens
                  conversationId = data.conversation_id
                }
              })
          })

          stream.on('end', () => {
            resolve({ answer, conversationId, totalTokens })
          })

          stream.on('error', (error) => {
            reject(error)
          })
        })

        responseMapping?.forEach((mapping) => {
          if (!mapping.variableId) return

          const item = mapping.item ?? 'Answer'
          if (item === 'Answer')
            variables.set(mapping.variableId, convertNonMarkdownLinks(answer))

          if (item === 'Conversation ID' && isNotEmpty(conversationId))
            variables.set(mapping.variableId, conversationId)

          if (item === 'Total Tokens')
            variables.set(mapping.variableId, totalTokens)
        })
      } catch (error) {
        if (error instanceof HTTPError)
          return logs.add({
            status: 'error',
            description: error.message,
            details: error.response.body,
          })
        console.error(error)
      }
    },
  },
})

const convertNonMarkdownLinks = (text: string) => {
  const nonMarkdownLinks = /(?<![\([])https?:\/\/\S+/g
  return text.replace(nonMarkdownLinks, (match) => `[${match}](${match})`)
}
