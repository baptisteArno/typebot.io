import { getChatCompletionSetVarIds } from "@typebot.io/ai/getChatCompletionSetVarIds";
import { getChatCompletionStreamVarId } from "@typebot.io/ai/getChatCompletionStreamVarId";
import { parseChatCompletionOptions } from "@typebot.io/ai/parseChatCompletionOptions";
import { createAction } from "@typebot.io/forge";
import { auth } from "../auth";

export const modelsFetcher = {
  id: "fetchModels",
} as const;

export const createChatCompletion = createAction({
  name: "Create chat completion",
  auth,
  turnableInto: [
    {
      blockId: "openai",
    },
    {
      blockId: "groq",
    },
    {
      blockId: "together-ai",
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
    {
      blockId: "deepseek",
      transform: (options) => ({
        ...options,
        model: undefined,
      }),
    },
  ],
  options: parseChatCompletionOptions({
    models: {
      type: "fetcher",
      id: modelsFetcher.id,
    },
  }),
  fetchers: [modelsFetcher],
  getSetVariableIds: getChatCompletionSetVarIds,
  getStreamVariableId: getChatCompletionStreamVarId,
});
