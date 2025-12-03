import { getChatCompletionSetVarIds } from "@typebot.io/ai/getChatCompletionSetVarIds";
import { getChatCompletionStreamVarId } from "@typebot.io/ai/getChatCompletionStreamVarId";
import { parseChatCompletionOptions } from "@typebot.io/ai/parseChatCompletionOptions";
import { createAction } from "@typebot.io/forge";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import ky from "ky";
import { auth } from "../auth";
import { defaultOpenRouterOptions } from "../constants";
import type { ModelsResponse } from "../types";

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
      id: "fetchModels",
    },
  }),
  getSetVariableIds: getChatCompletionSetVarIds,
  fetchers: [
    {
      id: "fetchModels",
      dependencies: [],
      fetch: async () => {
        try {
          const response = await ky
            .get(defaultOpenRouterOptions.baseUrl + "/models")
            .json<ModelsResponse>();

          return {
            data: response.data.map((model) => ({
              value: model.id,
              label: model.name,
            })),
          };
        } catch (err) {
          return {
            error: await parseUnknownError({ err, context: "Fetching models" }),
          };
        }
      },
    },
  ],
  getStreamVariableId: getChatCompletionStreamVarId,
});
