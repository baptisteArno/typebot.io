import { getChatCompletionSetVarIds } from "@typebot.io/ai/getChatCompletionSetVarIds";
import { getChatCompletionStreamVarId } from "@typebot.io/ai/getChatCompletionStreamVarId";
import { parseChatCompletionOptions } from "@typebot.io/ai/parseChatCompletionOptions";
import { createAction } from "@typebot.io/forge";
import { auth } from "../auth";
import { baseOptions } from "../baseOptions";
import { chatModels, reasoningModels } from "../constants";

export const createChatCompletion = createAction({
  name: "Create chat completion",
  auth,
  baseOptions,
  options: parseChatCompletionOptions({
    models: {
      type: "static",
      models: chatModels.concat(reasoningModels),
    },
  }),
  getSetVariableIds: getChatCompletionSetVarIds,
  getStreamVariableId: getChatCompletionStreamVarId,
  turnableInto: [
    {
      blockId: "open-router",
    },
    {
      blockId: "together-ai",
    },
    {
      blockId: "mistral",
      transform: (options) => ({ ...options, model: undefined }),
    },
    { blockId: "groq" },
    {
      blockId: "perplexity",
      transform: (options) => ({
        ...options,
        model: undefined,
      }),
    },
    {
      blockId: "anthropic",
      transform: (options) => ({
        ...options,
        model: undefined,
        action: "Create Chat Message",
      }),
    },
    {
      blockId: "deepseek",
      transform: (options) => ({
        ...options,
        model: undefined,
      }),
    },
  ],
});
