import { createOpenAI } from "@ai-sdk/openai";
import { getChatCompletionSetVarIds } from "@typebot.io/ai/getChatCompletionSetVarIds";
import { getChatCompletionStreamVarId } from "@typebot.io/ai/getChatCompletionStreamVarId";
import { parseChatCompletionOptions } from "@typebot.io/ai/parseChatCompletionOptions";
import { runChatCompletion } from "@typebot.io/ai/runChatCompletion";
import { runChatCompletionStream } from "@typebot.io/ai/runChatCompletionStream";
import { createAction } from "@typebot.io/forge";
import { auth } from "../auth";
import { baseOptions } from "../baseOptions";
import { fetchGPTModels } from "../helpers/fetchModels";
import { isModelCompatibleWithVision } from "../helpers/isModelCompatibleWithVision";

export const createChatCompletion = createAction({
  name: "Create chat completion",
  auth,
  baseOptions,
  options: parseChatCompletionOptions({
    models: {
      type: "fetcher",
      id: "fetchModels",
    },
  }),
  getSetVariableIds: getChatCompletionSetVarIds,
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
  fetchers: [
    {
      id: "fetchModels",
      dependencies: ["baseUrl", "apiVersion"],
      fetch: ({ credentials, options }) =>
        fetchGPTModels({
          apiKey: credentials?.apiKey,
          baseUrl: credentials?.baseUrl ?? options.baseUrl,
          apiVersion: options.apiVersion,
        }),
    },
  ],
  run: {
    server: ({
      credentials: { apiKey, baseUrl },
      options,
      variables,
      logs,
    }) => {
      if (!apiKey) return logs.add("No API key provided");
      const modelName = options.model?.trim();
      if (!modelName) return logs.add("No model provided");
      if (!options.messages) return logs.add("No messages provided");

      return runChatCompletion({
        model: createOpenAI({
          baseURL: baseUrl ?? options.baseUrl,
          apiKey,
          compatibility: "strict",
        })(modelName),
        variables,
        messages: options.messages,
        tools: options.tools,
        isVisionEnabled: isModelCompatibleWithVision(modelName),
        temperature: options.temperature,
        responseMapping: options.responseMapping,
        logs,
      });
    },
    stream: {
      getStreamVariableId: getChatCompletionStreamVarId,
      run: async ({ credentials: { apiKey, baseUrl }, options, variables }) => {
        const context = "While streaming OpenAI chat completion";
        if (!apiKey)
          return {
            error: {
              description: "No API key provided",
              context,
            },
          };
        const modelName = options.model?.trim();
        if (!modelName)
          return {
            error: {
              description: "No model provided",
              context,
            },
          };
        if (!options.messages)
          return {
            error: {
              description: "No messages provided",
              context,
            },
          };

        return runChatCompletionStream({
          model: createOpenAI({
            baseURL: baseUrl ?? options.baseUrl,
            apiKey,
            compatibility: "strict",
          })(modelName),
          variables,
          messages: options.messages,
          isVisionEnabled: isModelCompatibleWithVision(modelName),
          tools: options.tools,
          temperature: options.temperature,
          responseMapping: options.responseMapping,
        });
      },
    },
  },
});
