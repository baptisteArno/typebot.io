import { createGroq } from "@ai-sdk/groq";
import { getChatCompletionSetVarIds } from "@typebot.io/ai/getChatCompletionSetVarIds";
import { getChatCompletionStreamVarId } from "@typebot.io/ai/getChatCompletionStreamVarId";
import { parseChatCompletionOptions } from "@typebot.io/ai/parseChatCompletionOptions";
import { runChatCompletion } from "@typebot.io/ai/runChatCompletion";
import { runChatCompletionStream } from "@typebot.io/ai/runChatCompletionStream";
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
  run: {
    server: async ({
      credentials: { apiKey },
      options,
      variables,
      logs,
      sessionStore,
    }) => {
      if (!apiKey) return logs.add("No API key provided");
      const modelName = options.model?.trim();
      if (!modelName) return logs.add("No model provided");
      if (!options.messages) return logs.add("No messages provided");

      await runChatCompletion({
        model: createGroq({
          apiKey,
        })(modelName),
        variables,
        messages: options.messages,
        tools: options.tools,
        isVisionEnabled: false,
        temperature: options.temperature,
        responseMapping: options.responseMapping,
        logs,
        sessionStore,
      });
    },
    stream: {
      getStreamVariableId: getChatCompletionStreamVarId,
      run: async ({
        credentials: { apiKey },
        options,
        variables,
        sessionStore,
      }) => {
        if (!apiKey)
          return {
            error: {
              description: "No API key provided",
            },
          };
        const modelName = options.model?.trim();
        if (!modelName)
          return {
            error: {
              description: "No model provided",
            },
          };
        if (!options.messages)
          return {
            error: {
              description: "No messages provided",
            },
          };

        return runChatCompletionStream({
          model: createGroq({
            apiKey,
          })(modelName),
          variables,
          messages: options.messages,
          isVisionEnabled: false,
          tools: options.tools,
          temperature: options.temperature,
          responseMapping: options.responseMapping,
          sessionStore,
        });
      },
    },
  },
});
