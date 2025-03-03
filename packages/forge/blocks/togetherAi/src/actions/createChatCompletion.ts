import { createTogetherAI } from "@ai-sdk/togetherai";
import { getChatCompletionSetVarIds } from "@typebot.io/ai/getChatCompletionSetVarIds";
import { getChatCompletionStreamVarId } from "@typebot.io/ai/getChatCompletionStreamVarId";
import { parseChatCompletionOptions } from "@typebot.io/ai/parseChatCompletionOptions";
import { runChatCompletion } from "@typebot.io/ai/runChatCompletion";
import { runChatCompletionStream } from "@typebot.io/ai/runChatCompletionStream";
import { createAction } from "@typebot.io/forge";
import { auth } from "../auth";

export const createChatCompletion = createAction({
  name: "Create chat completion",
  auth,
  options: parseChatCompletionOptions({
    models: {
      type: "text",
      helperText:
        "You can find the list of all the models available [here](https://docs.together.ai/docs/inference-models#chat-models). Copy the model string for API.",
    },
  }),
  turnableInto: [
    {
      blockId: "openai",
    },
    {
      blockId: "open-router",
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
    { blockId: "groq" },
    { blockId: "deepseek" },
  ],
  getSetVariableIds: getChatCompletionSetVarIds,
  run: {
    server: ({ credentials: { apiKey }, options, variables, logs }) => {
      if (!apiKey) return logs.add("No API key provided");
      const modelName = options.model?.trim();
      if (!modelName) return logs.add("No model provided");
      if (!options.messages) return logs.add("No messages provided");

      return runChatCompletion({
        model: createTogetherAI({
          apiKey,
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
            error: { description: "No messages provided" },
          };

        return runChatCompletionStream({
          model: createTogetherAI({
            apiKey,
          })(modelName),
          variables,
          messages: options.messages,
          tools: options.tools,
          isVisionEnabled: false,
          temperature: options.temperature,
          responseMapping: options.responseMapping,
        });
      },
    },
  },
});
