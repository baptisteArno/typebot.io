import { createPerplexity } from "@ai-sdk/perplexity";
import { getChatCompletionStreamVarId } from "@typebot.io/ai/getChatCompletionStreamVarId";
import { parseChatCompletionOptions } from "@typebot.io/ai/parseChatCompletionOptions";
import { runChatCompletion } from "@typebot.io/ai/runChatCompletion";
import { runChatCompletionStream } from "@typebot.io/ai/runChatCompletionStream";
import { createAction } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import { auth } from "../auth";
import { perplexityModels } from "../constants";

export const createChatCompletion = createAction({
  name: "Create chat completion",
  auth,
  options: parseChatCompletionOptions({
    models: {
      type: "static",
      models: perplexityModels,
    },
  }),
  turnableInto: [
    {
      blockId: "openai",
      transform: (opts) => ({
        ...opts,
        model: undefined,
      }),
    },
    {
      blockId: "mistral",
      transform: (opts) => ({
        ...opts,
        model: undefined,
      }),
    },
    {
      blockId: "groq",
      transform: (opts) => ({
        ...opts,
        model: undefined,
      }),
    },
    {
      blockId: "together-ai",
    },
    { blockId: "open-router" },
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
  getSetVariableIds: (options) =>
    options.responseMapping?.map((res) => res.variableId).filter(isDefined) ??
    [],
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
        model: createPerplexity({
          apiKey,
          baseURL: baseUrl ?? undefined,
        })(modelName),
        variables,
        messages: options.messages,
        tools: options.tools,
        isVisionEnabled: false,
        temperature: options.temperature,
        responseMapping: options.responseMapping,
        logs,
      });
    },
    stream: {
      getStreamVariableId: getChatCompletionStreamVarId,
      run: async ({ credentials: { apiKey, baseUrl }, options, variables }) => {
        if (!apiKey)
          return {
            error: {
              description: "No API key provided",
            },
          };
        const modelName = options.model?.trim();
        if (!modelName)
          return {
            error: { description: "No model provided" },
          };
        if (!options.messages)
          return {
            error: {
              description: "No messages provided",
            },
          };

        return runChatCompletionStream({
          model: createPerplexity({
            apiKey,
            baseURL: baseUrl ?? undefined,
          })(modelName),
          variables,
          messages: options.messages,
          isVisionEnabled: false,
          tools: options.tools,
          temperature: options.temperature,
          responseMapping: options.responseMapping,
        });
      },
    },
  },
});
