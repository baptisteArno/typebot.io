import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { getChatCompletionSetVarIds } from "@typebot.io/ai/getChatCompletionSetVarIds";
import { getChatCompletionStreamVarId } from "@typebot.io/ai/getChatCompletionStreamVarId";
import { parseChatCompletionOptions } from "@typebot.io/ai/parseChatCompletionOptions";
import { runChatCompletion } from "@typebot.io/ai/runChatCompletion";
import { runChatCompletionStream } from "@typebot.io/ai/runChatCompletionStream";
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
    {
      blockId: "anthropic",
      transform: (options) => ({
        ...options,
        action: "Create Chat Message",
      }),
    },
  ],
  options: parseChatCompletionOptions({
    modelFetchId: "fetchModels",
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
  run: {
    server: ({ credentials: { apiKey }, options, variables, logs }) => {
      if (!apiKey) return logs.add("No API key provided");
      const modelName = options.model?.trim();
      if (!modelName) return logs.add("No model provided");
      if (!options.messages) return logs.add("No messages provided");

      return runChatCompletion({
        model: createOpenRouter({
          apiKey,
        }).chat(modelName),
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
          model: createOpenRouter({
            apiKey,
          }).chat(modelName),
          variables,
          messages: options.messages,
          tools: options.tools,
          isVisionEnabled: false,
          temperature: options.temperature
            ? Number(options.temperature)
            : undefined,
          responseMapping: options.responseMapping,
        });
      },
    },
  },
});
