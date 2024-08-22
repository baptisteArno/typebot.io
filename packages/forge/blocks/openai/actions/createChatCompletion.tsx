import { createAction } from '@typebot.io/forge'
import { defaultOpenAIOptions } from '../constants'
import { auth } from '../auth'
import { baseOptions } from '../baseOptions'
import { parseChatCompletionOptions } from '../shared/parseChatCompletionOptions'
import { getChatCompletionSetVarIds } from '../shared/getChatCompletionSetVarIds'
import { runOpenAIChatCompletion } from '../shared/runOpenAIChatCompletion'
import { runOpenAIChatCompletionStream } from '../shared/runOpenAIChatCompletionStream'
import { getChatCompletionStreamVarId } from '../shared/getChatCompletionStreamVarId'
import { fetchGPTModels } from '../helpers/fetchModels'

export const createChatCompletion = createAction({
  name: 'Create chat completion',
  auth,
  baseOptions,
  options: parseChatCompletionOptions({
    defaultTemperature: defaultOpenAIOptions.temperature,
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
    { blockId: 'groq' },
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
      dependencies: ['baseUrl', 'apiVersion'],
      fetch: ({ credentials, options }) =>
        fetchGPTModels({
          apiKey: credentials?.apiKey,
          baseUrl: options.baseUrl,
          apiVersion: options.apiVersion,
        }),
    },
  ],
  run: {
    server: (params) =>
      runOpenAIChatCompletion({
        ...params,
        config: {
          baseUrl: params.credentials.baseUrl,
          defaultModel: defaultOpenAIOptions.model,
        },
        compatibility: 'strict',
      }),
    stream: {
      getStreamVariableId: getChatCompletionStreamVarId,
      run: async (params) =>
        runOpenAIChatCompletionStream({
          ...params,
          config: {
            baseUrl: params.credentials.baseUrl,
            defaultModel: defaultOpenAIOptions.model,
          },
          compatibility: 'strict',
        }),
    },
  },
})
