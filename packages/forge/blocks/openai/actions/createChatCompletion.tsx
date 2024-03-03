import { createAction } from '@typebot.io/forge'
import OpenAI, { ClientOptions } from 'openai'
import { defaultOpenAIOptions } from '../constants'
import { auth } from '../auth'
import { baseOptions } from '../baseOptions'
import { parseChatCompletionOptions } from '../shared/parseChatCompletionOptions'
import { getChatCompletionSetVarIds } from '../shared/getChatCompletionSetVarIds'
import { runChatCompletion } from '../shared/runChatCompletion'
import { runChatCompletionStream } from '../shared/runChatCompletionStream'
import { getChatCompletionStreamVarId } from '../shared/getChatCompletionStreamVarId'

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
  fetchers: [
    {
      id: 'fetchModels',
      dependencies: ['baseUrl', 'apiVersion'],
      fetch: async ({ credentials, options }) => {
        const baseUrl = options?.baseUrl ?? defaultOpenAIOptions.baseUrl
        const config = {
          apiKey: credentials.apiKey,
          baseURL: baseUrl ?? defaultOpenAIOptions.baseUrl,
          defaultHeaders: {
            'api-key': credentials.apiKey,
          },
          defaultQuery: options?.apiVersion
            ? {
                'api-version': options.apiVersion,
              }
            : undefined,
        } satisfies ClientOptions

        const openai = new OpenAI(config)

        const models = await openai.models.list()

        return (
          models.data
            .filter((model) => model.id.includes('gpt'))
            .sort((a, b) => b.created - a.created)
            .map((model) => model.id) ?? []
        )
      },
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
      run: (params) =>
        runChatCompletionStream({
          ...params,
          config: {
            baseUrl: defaultOpenAIOptions.baseUrl,
            defaultModel: defaultOpenAIOptions.model,
          },
        }),
    },
  },
})
