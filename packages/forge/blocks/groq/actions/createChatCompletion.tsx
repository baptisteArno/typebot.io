import { createAction } from '@typebot.io/forge'
import { auth } from '../auth'
import { parseChatCompletionOptions } from '@typebot.io/openai-block/shared/parseChatCompletionOptions'
import { getChatCompletionSetVarIds } from '@typebot.io/openai-block/shared/getChatCompletionSetVarIds'
import { getChatCompletionStreamVarId } from '@typebot.io/openai-block/shared/getChatCompletionStreamVarId'
import { runOpenAIChatCompletion } from '@typebot.io/openai-block/shared/runOpenAIChatCompletion'
import { runOpenAIChatCompletionStream } from '@typebot.io/openai-block/shared/runOpenAIChatCompletionStream'
import { defaultBaseUrl, defaultTemperature } from '../constants'
import ky from 'ky'

export const createChatCompletion = createAction({
  name: 'Create chat completion',
  auth,
  options: parseChatCompletionOptions({
    modelFetchId: 'fetchModels',
    defaultTemperature,
  }),
  fetchers: [
    {
      id: 'fetchModels',
      fetch: async ({ credentials }) => {
        if (!credentials?.apiKey) return []

        const response = await ky
          .get(`${defaultBaseUrl}/models`, {
            headers: {
              authorization: `Bearer ${credentials.apiKey}`,
            },
          })
          .json<{ data: { id: string; created: number }[] }>()

        return response.data
          .sort((a, b) => b.created - a.created)
          .map((model) => model.id)
      },
      dependencies: [],
    },
  ],
  turnableInto: [
    {
      blockId: 'openai',
    },
    {
      blockId: 'open-router',
    },
    { blockId: 'mistral' },
    {
      blockId: 'anthropic',
      transform: (options) => ({
        ...options,
        action: 'Create Chat Message',
        responseMapping: options.responseMapping?.map((res: any) =>
          res.item === 'Message content'
            ? { ...res, item: 'Message Content' }
            : res
        ),
      }),
    },
    {
      blockId: 'together-ai',
    },
  ],
  getSetVariableIds: getChatCompletionSetVarIds,
  run: {
    server: (params) =>
      runOpenAIChatCompletion({
        ...params,
        config: { baseUrl: defaultBaseUrl },
      }),
    stream: {
      getStreamVariableId: getChatCompletionStreamVarId,
      run: async (params) =>
        runOpenAIChatCompletionStream({
          ...params,
          config: {
            baseUrl: defaultBaseUrl,
          },
        }),
    },
  },
})
