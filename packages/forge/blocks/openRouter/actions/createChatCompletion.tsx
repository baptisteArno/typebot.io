import { createAction } from '@typebot.io/forge'
import { auth } from '../auth'
import { parseChatCompletionOptions } from '@typebot.io/openai-block/shared/parseChatCompletionOptions'
import { getChatCompletionSetVarIds } from '@typebot.io/openai-block/shared/getChatCompletionSetVarIds'
import { getChatCompletionStreamVarId } from '@typebot.io/openai-block/shared/getChatCompletionStreamVarId'
import { runChatCompletion } from '@typebot.io/openai-block/shared/runChatCompletion'
import { runChatCompletionStream } from '@typebot.io/openai-block/shared/runChatCompletionStream'
import { defaultOpenRouterOptions } from '../constants'
import ky from 'ky'
import { ModelsResponse } from '../types'

export const createChatCompletion = createAction({
  name: 'Create chat completion',
  auth,
  turnableInto: [
    {
      blockId: 'openai',
    },
    {
      blockId: 'together-ai',
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
  ],
  options: parseChatCompletionOptions({
    modelFetchId: 'fetchModels',
  }),
  getSetVariableIds: getChatCompletionSetVarIds,
  fetchers: [
    {
      id: 'fetchModels',
      dependencies: [],
      fetch: async () => {
        const response = await ky
          .get(defaultOpenRouterOptions.baseUrl + '/models')
          .json<ModelsResponse>()

        return response.data.map((model) => ({
          value: model.id,
          label: model.name,
        }))
      },
    },
  ],
  run: {
    server: (params) =>
      runChatCompletion({
        ...params,
        config: { baseUrl: defaultOpenRouterOptions.baseUrl },
      }),
    stream: {
      getStreamVariableId: getChatCompletionStreamVarId,
      run: (params) =>
        runChatCompletionStream({
          ...params,
          config: { baseUrl: defaultOpenRouterOptions.baseUrl },
        }),
    },
  },
})
