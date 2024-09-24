import { createAction } from "@typebot.io/forge";
import { getChatCompletionSetVarIds } from "@typebot.io/openai-block/shared/getChatCompletionSetVarIds";
import { getChatCompletionStreamVarId } from "@typebot.io/openai-block/shared/getChatCompletionStreamVarId";
import { parseChatCompletionOptions } from "@typebot.io/openai-block/shared/parseChatCompletionOptions";
import { runOpenAIChatCompletion } from "@typebot.io/openai-block/shared/runOpenAIChatCompletion";
import { runOpenAIChatCompletionStream } from "@typebot.io/openai-block/shared/runOpenAIChatCompletionStream";
import { auth } from "../auth";
import { defaultTogetherOptions } from "../constants";

export const createChatCompletion = createAction({
  name: "Create chat completion",
  auth,
  options: parseChatCompletionOptions({
    modelHelperText:
      "You can find the list of all the models available [here](https://docs.together.ai/docs/inference-models#chat-models). Copy the model string for API.",
    defaultTemperature: defaultTogetherOptions.temperature,
  }),
  turnableInto: [
    {
      blockId: "openai",
    },
    {
      blockId: "open-router",
    },
    { blockId: "mistral" },
    {
      blockId: "anthropic",
      transform: (options) => ({
        ...options,
        action: "Create Chat Message",
        responseMapping: options.responseMapping?.map((res: any) =>
          res.item === "Message content"
            ? { ...res, item: "Message Content" }
            : res,
        ),
      }),
    },
    { blockId: "groq" },
  ],
  getSetVariableIds: getChatCompletionSetVarIds,
  run: {
    server: (params) =>
      runOpenAIChatCompletion({
        ...params,
        config: { baseUrl: defaultTogetherOptions.baseUrl },
      }),
    stream: {
      getStreamVariableId: getChatCompletionStreamVarId,
      run: async (params) =>
        runOpenAIChatCompletionStream({
          ...params,
          config: {
            baseUrl: defaultTogetherOptions.baseUrl,
          },
        }),
    },
  },
});
