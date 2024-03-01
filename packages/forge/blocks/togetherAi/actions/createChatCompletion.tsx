import { createAction } from '@typebot.io/forge'
import { auth } from '../auth'
import { parseChatCompletionOptions } from '@typebot.io/openai-block/shared/parseChatCompletionOptions'
import { getChatCompletionSetVarIds } from '@typebot.io/openai-block/shared/getChatCompletionSetVarIds'
import { getChatCompletionStreamVarId } from '@typebot.io/openai-block/shared/getChatCompletionStreamVarId'
import { runChatCompletion } from '@typebot.io/openai-block/shared/runChatCompletion'
import { runChatCompletionStream } from '@typebot.io/openai-block/shared/runChatCompletionStream'
import { defaultTogetherOptions } from '../constants'

export const createChatCompletion = createAction({
  name: 'Create chat completion',
  auth,
  options: parseChatCompletionOptions({
    modelHelperText:
      'You can find the list of all the models available [here](https://docs.together.ai/docs/inference-models#chat-models). Copy the model string for API.',
  }),
  getSetVariableIds: getChatCompletionSetVarIds,
  run: {
    server: (params) =>
      runChatCompletion({
        ...params,
        config: { baseUrl: defaultTogetherOptions.baseUrl },
      }),
    stream: {
      getStreamVariableId: getChatCompletionStreamVarId,
      run: (params) =>
        runChatCompletionStream({
          ...params,
          config: { baseUrl: defaultTogetherOptions.baseUrl },
        }),
    },
  },
})
