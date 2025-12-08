import { getChatCompletionSetVarIds } from "@typebot.io/ai/getChatCompletionSetVarIds";
import { getChatCompletionStreamVarId } from "@typebot.io/ai/getChatCompletionStreamVarId";
import { parseChatCompletionOptions } from "@typebot.io/ai/parseChatCompletionOptions";
import { createAction } from "@typebot.io/forge";
import { auth } from "../auth";

export const createChatCompletion = createAction({
  name: "Create chat completion",
  auth,
  options: parseChatCompletionOptions({
    models: {
      type: "text",
      helperText:
        "You can find the list of all the models available [here](https://docs.together.ai/docs/inference-models#chat-models). Copy the model string for API.",
    },
  }),
  turnableInto: [
    {
      blockId: "openai",
    },
    {
      blockId: "open-router",
    },
    { blockId: "mistral" },
    { blockId: "perplexity" },
    {
      blockId: "anthropic",
      transform: (options) => ({
        ...options,
        action: "Create Chat Message",
      }),
    },
    { blockId: "groq" },
    { blockId: "deepseek" },
  ],
  getSetVariableIds: getChatCompletionSetVarIds,
  getStreamVariableId: getChatCompletionStreamVarId,
});
