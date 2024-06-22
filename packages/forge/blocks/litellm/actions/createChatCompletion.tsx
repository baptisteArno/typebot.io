import { createAction } from '@typebot.io/forge'
import { auth } from '../auth'
import { parseChatCompletionOptions } from '../shared/parseChatCompletionOptions'
import { getChatCompletionSetVarIds } from '../shared/getChatCompletionSetVarIds'
import { runChatCompletion } from '../shared/runChatCompletion'
import { runChatCompletionStream } from '../shared/runChatCompletionStream'
import { getChatCompletionStreamVarId } from '../shared/getChatCompletionStreamVarId'
import { fetchGPTModels } from '../helpers/fetchModels'

export const createChatCompletion = createAction({
  name: 'Create chat completion',
  auth,
  options: parseChatCompletionOptions({
    defaultModel: "",
    defaultTemperature: 1,
    modelFetchId: 'fetchModels',
  }),
  getSetVariableIds: getChatCompletionSetVarIds,
  turnableInto: [
    {
      blockId: 'open-router',
    },
    {
      blockId: 'together-ai',
    },
    { blockId: 'mistral' },
    {
      blockId: 'anthropic',
      transform: (options) => ({
        ...options,
        model: undefined,
        action: 'Create Chat Message',
        responseMapping: options.responseMapping?.map((res: any) =>
          res.item === 'Message content'
            ? { ...res, item: 'Message Content' }
            : res
        ),
      }),
    },
  ],
  fetchers: [
    {
      id: 'fetchModels',
      dependencies: [],
      fetch: ({ credentials }) =>
        fetchGPTModels({
          apiKey: credentials?.apiKey,
          baseURL: credentials?.baseURL,
          apiVersion: credentials?.apiVersion,
        }),
    },
  ],
  run: {
    server: (params) =>
      runChatCompletion({
        ...params,
        config: {
          baseUrl: params.credentials.baseURL ?? '',
          defaultModel: params.options.model,
        },
      }),
    stream: {
      getStreamVariableId: getChatCompletionStreamVarId,
      run: async (params) => ({
        stream: await runChatCompletionStream({
          ...params,
          config: {
            baseUrl: params.credentials.baseURL ?? '',
            defaultModel: params.options.model,
          },
        }),
      }),
    },
  },
})
