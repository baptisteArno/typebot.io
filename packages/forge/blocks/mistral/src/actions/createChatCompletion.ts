import { createMistral } from "@ai-sdk/mistral";
import { getChatCompletionStreamVarId } from "@typebot.io/ai/getChatCompletionStreamVarId";
import { parseChatCompletionOptions } from "@typebot.io/ai/parseChatCompletionOptions";
import { runChatCompletion } from "@typebot.io/ai/runChatCompletion";
import { runChatCompletionStream } from "@typebot.io/ai/runChatCompletionStream";
import { createAction } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import { auth } from "../auth";
import { fetchModels } from "../helpers/fetchModels";

export const createChatCompletion = createAction({
  name: "Create chat completion",
  auth,
  options: parseChatCompletionOptions({
    modelFetchId: "fetchModels",
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
  ],
  getSetVariableIds: (options) =>
    options.responseMapping?.map((res) => res.variableId).filter(isDefined) ??
    [],
  fetchers: [
    {
      id: "fetchModels",
      dependencies: [],
      fetch: fetchModels,
    },
  ],
  run: {
    server: ({ credentials: { apiKey }, options, variables, logs }) => {
      if (!apiKey) return logs.add("No API key provided");
      const modelName = options.model?.trim();
      if (!modelName) return logs.add("No model provided");
      if (!options.messages) return logs.add("No messages provided");

      return runChatCompletion({
        model: createMistral({
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
            error: { description: "No model provided" },
          };
        if (!options.messages)
          return {
            error: {
              description: "No messages provided",
            },
          };

        return runChatCompletionStream({
          model: createMistral({
            apiKey,
          }).chat(modelName),
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
