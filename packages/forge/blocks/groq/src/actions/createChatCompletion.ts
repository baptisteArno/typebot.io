import { createGroq } from "@ai-sdk/groq";
import { getChatCompletionSetVarIds } from "@typebot.io/ai/getChatCompletionSetVarIds";
import { getChatCompletionStreamVarId } from "@typebot.io/ai/getChatCompletionStreamVarId";
import { parseChatCompletionOptions } from "@typebot.io/ai/parseChatCompletionOptions";
import { runChatCompletion } from "@typebot.io/ai/runChatCompletion";
import { runChatCompletionStream } from "@typebot.io/ai/runChatCompletionStream";
import { createAction } from "@typebot.io/forge";
import ky from "ky";
import { auth } from "../auth";
import { defaultBaseUrl } from "../constants";

export const createChatCompletion = createAction({
  name: "Create chat completion",
  auth,
  options: parseChatCompletionOptions({
    modelFetchId: "fetchModels",
  }),
  fetchers: [
    {
      id: "fetchModels",
      fetch: async ({ credentials }) => {
        if (!credentials?.apiKey) return [];

        const response = await ky
          .get(`${defaultBaseUrl}/models`, {
            headers: {
              authorization: `Bearer ${credentials.apiKey}`,
            },
          })
          .json<{ data: { id: string; created: number }[] }>();

        return response.data
          .sort((a, b) => b.created - a.created)
          .map((model) => model.id);
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
      blockId: "together-ai",
    },
  ],
  getSetVariableIds: getChatCompletionSetVarIds,
  run: {
    server: ({ credentials: { apiKey }, options, variables, logs }) => {
      if (!apiKey) return logs.add("No API key provided");
      const modelName = options.model?.trim();
      if (!modelName) return logs.add("No model provided");
      if (!options.messages) return logs.add("No messages provided");

      return runChatCompletion({
        model: createGroq({
          apiKey,
        })(modelName),
        variables,
        messages: options.messages,
        tools: options.tools,
        isVisionEnabled: false,
        temperature: options.temperature
          ? Number(options.temperature)
          : undefined,
        responseMapping: options.responseMapping,
        logs,
      });
    },
    stream: {
      getStreamVariableId: getChatCompletionStreamVarId,
      run: async ({ credentials: { apiKey }, options, variables }) => {
        if (!apiKey)
          return { httpError: { status: 400, message: "No API key provided" } };
        const modelName = options.model?.trim();
        if (!modelName)
          return { httpError: { status: 400, message: "No model provided" } };
        if (!options.messages)
          return {
            httpError: { status: 400, message: "No messages provided" },
          };

        return runChatCompletionStream({
          model: createGroq({
            apiKey,
          })(modelName),
          variables,
          messages: options.messages,
          isVisionEnabled: false,
          tools: options.tools,
          temperature: options.temperature
            ? Number(options.temperature)
            : undefined,
          responseMapping: options.responseMapping,
        });
      },
    },
  },
});
