import { createAction } from '@typebot.io/forge'
import { defaultOpenAIOptions } from '../constants'
import { auth } from '../auth'
import { baseOptions } from '../baseOptions'
import { parseChatCompletionOptions } from '../shared/parseChatCompletionOptions'
import { getChatCompletionSetVarIds } from '../shared/getChatCompletionSetVarIds'
import { runChatCompletion } from '../shared/runChatCompletion'
import { runChatCompletionStream } from '../shared/runChatCompletionStream'
import { getChatCompletionStreamVarId } from '../shared/getChatCompletionStreamVarId'
import { fetchGPTModels } from '../helpers/fetchModels'

export const createChatCompletion = createAction({
  name: 'Create chat completion',
  auth,
  baseOptions,
  options: parseChatCompletionOptions({
    defaultModel: defaultOpenAIOptions.model,
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
      runChatCompletion({
        ...params,
        config: {
          baseUrl: defaultOpenAIOptions.baseUrl,
          defaultModel: defaultOpenAIOptions.model,
        },
      }),
    stream: {
      getStreamVariableId: getChatCompletionStreamVarId,
      run: async (params) => ({
        stream: await runChatCompletionStream({
          ...params,
          config: {
            baseUrl: defaultOpenAIOptions.baseUrl,
            defaultModel: defaultOpenAIOptions.model,
          },
        }),
      }),
    },
  },
})
