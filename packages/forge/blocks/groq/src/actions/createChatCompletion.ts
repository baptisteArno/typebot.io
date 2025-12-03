import { getChatCompletionSetVarIds } from "@typebot.io/ai/getChatCompletionSetVarIds";
import { getChatCompletionStreamVarId } from "@typebot.io/ai/getChatCompletionStreamVarId";
import { parseChatCompletionOptions } from "@typebot.io/ai/parseChatCompletionOptions";
import { createAction } from "@typebot.io/forge";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import ky from "ky";
import { auth } from "../auth";
import { defaultBaseUrl } from "../constants";

export const createChatCompletion = createAction({
  name: "Create chat completion",
  auth,
  options: parseChatCompletionOptions({
    models: {
      type: "fetcher",
      id: "fetchModels",
    },
  }),
  fetchers: [
    {
      id: "fetchModels",
      fetch: async ({ credentials }) => {
        if (!credentials?.apiKey)
          return {
            data: [],
          };

        try {
          const response = await ky
            .get(`${defaultBaseUrl}/models`, {
              headers: {
                authorization: `Bearer ${credentials.apiKey}`,
              },
            })
            .json<{ data: { id: string; created: number }[] }>();

          return {
            data: response.data
              .sort((a, b) => b.created - a.created)
              .map((model) => model.id),
          };
        } catch (err) {
          return {
            error: await parseUnknownError({ err }),
          };
        }
      },
      dependencies: [],
    },
  ],
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
      }),
    },
    {
      blockId: "perplexity",
    },
    {
      blockId: "together-ai",
    },
    {
      blockId: "deepseek",
    },
  ],
  getSetVariableIds: getChatCompletionSetVarIds,
  getStreamVariableId: getChatCompletionStreamVarId,
});
