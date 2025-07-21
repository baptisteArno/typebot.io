import { createDeepSeek } from "@ai-sdk/deepseek";
import { getChatCompletionSetVarIds } from "@typebot.io/ai/getChatCompletionSetVarIds";
import { getChatCompletionStreamVarId } from "@typebot.io/ai/getChatCompletionStreamVarId";
import { parseChatCompletionOptions } from "@typebot.io/ai/parseChatCompletionOptions";
import { runChatCompletion } from "@typebot.io/ai/runChatCompletion";
import { runChatCompletionStream } from "@typebot.io/ai/runChatCompletionStream";
import { createAction } from "@typebot.io/forge";
import { auth } from "../auth";
import { deepSeekModels } from "../constants";

export const createChatCompletion = createAction({
  name: "Create chat completion",
  auth,
  options: parseChatCompletionOptions({
    models: {
      type: "static",
      models: deepSeekModels,
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
      blockId: "groq",
      transform: (opts) => ({
        ...opts,
        model: undefined,
      }),
    },
    {
      blockId: "perplexity",
      transform: (options) => ({ ...options, model: undefined }),
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
  ],
  run: {
    server: async ({
      credentials: { apiKey, baseUrl },
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
        model: createDeepSeek({
          apiKey,
          baseURL: baseUrl ?? undefined,
        })(modelName),
        variables,
        messages: options.messages,
        tools: options.tools,
        isVisionEnabled: false,
        temperature: options.temperature,
        logs,
        responseMapping: options.responseMapping,
        sessionStore,
      });
    },
    stream: {
      getStreamVariableId: getChatCompletionStreamVarId,
      run: async ({
        credentials: { apiKey, baseUrl },
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
          model: createDeepSeek({
            apiKey,
            baseURL: baseUrl ?? undefined,
          })(modelName),
          variables,
          messages: options.messages,
          isVisionEnabled: false,
          responseMapping: options.responseMapping,
          tools: options.tools,
          temperature: options.temperature,
          sessionStore,
        });
      },
    },
  },
});
