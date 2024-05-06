import { createAction, option } from '@typebot.io/forge'
import { isDefined, isEmpty, isNotEmpty } from '@typebot.io/lib'
import { auth } from '../auth'
import { defaultBaseUrl } from '../constants'
import { Chunk } from '../types'
import ky from 'ky'
import { deprecatedCreateChatMessageOptions } from '../deprecated'

export const createChatMessage = createAction({
  auth,
  name: 'Create Chat Message',
  options: option
    .object({
      query: option.string.layout({
        label: 'Query',
        placeholder: 'User input/question content',
        inputType: 'textarea',
        isRequired: true,
      }),

      conversationVariableId: option.string.layout({
        label: 'Conversation ID',
        moreInfoTooltip:
          'Used to remember the conversation with the user. If empty, a new conversation ID is created.',
        inputType: 'variableDropdown',
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
        .saveResponseArray(
          ['Answer', 'Conversation ID', 'Total Tokens'] as const,
          {
            item: {
              hiddenItems: ['Conversation ID'],
            },
          }
        )
        .layout({
          accordion: 'Save response',
        }),
    })
    .merge(deprecatedCreateChatMessageOptions),
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((r) => r.variableId).filter(isDefined) ?? [],
  run: {
    server: async ({
      credentials: { apiEndpoint, apiKey },
      options: {
        conversationVariableId,
        conversation_id,
        query,
        user,
        inputs,
        responseMapping,
      },
      variables,
      logs,
    }) => {
      const existingDifyConversationId = conversationVariableId
        ? variables.get(conversationVariableId)
        : conversation_id
      try {
        const response = await ky(
          (apiEndpoint ?? defaultBaseUrl) + '/v1/chat-messages',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
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
              conversation_id: existingDifyConversationId,
              user,
              files: [],
            }),
          }
        )

        const reader = response.body?.getReader()

        if (!reader)
          return logs.add({
            status: 'error',
            description: 'Failed to read response stream',
          })

        const { answer, conversationId, totalTokens } = await new Promise<{
          answer: string
          conversationId: string | undefined
          totalTokens: number | undefined
        }>(async (resolve, reject) => {
          let jsonChunk = ''
          let answer = ''
          let conversationId: string | undefined
          let totalTokens: number | undefined

          try {
            while (true) {
              const { value, done } = await reader.read()
              if (done) {
                resolve({ answer, conversationId, totalTokens })
                return
              }

              const chunk = new TextDecoder().decode(value)

              const lines = chunk.toString().split('\n') as string[]
              lines
                .filter((line) => line.length > 0 && line !== '\n')
                .forEach((line) => {
                  jsonChunk += line
                  if (jsonChunk.startsWith('event: ')) {
                    jsonChunk = ''
                    return
                  }
                  if (
                    !jsonChunk.startsWith('data: ') ||
                    !jsonChunk.endsWith('}')
                  )
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
            }
          } catch (e) {
            reject(e)
          }
        })

        responseMapping?.forEach((mapping) => {
          if (!mapping.variableId) return

          const item = mapping.item ?? 'Answer'
          if (item === 'Answer')
            variables.set(mapping.variableId, convertNonMarkdownLinks(answer))

          if (
            item === 'Conversation ID' &&
            isNotEmpty(conversationId) &&
            isEmpty(existingDifyConversationId?.toString())
          )
            variables.set(mapping.variableId, conversationId)

          if (
            conversationVariableId &&
            isNotEmpty(conversationId) &&
            isEmpty(existingDifyConversationId?.toString())
          )
            variables.set(conversationVariableId, conversationId)

          if (item === 'Total Tokens')
            variables.set(mapping.variableId, totalTokens)
        })
      } catch (error) {
        logs.add({
          status: 'error',
          description: 'Failed to create chat message',
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
