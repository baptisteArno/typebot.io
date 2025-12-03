import { createAnthropic } from "@ai-sdk/anthropic";
import { runChatCompletion } from "@typebot.io/ai/runChatCompletion";
import { runChatCompletionStream } from "@typebot.io/ai/runChatCompletionStream";
import { createActionHandler } from "@typebot.io/forge";
import { createChatMessage } from "../actions/createChatMessage";
import { isModelCompatibleWithVision } from "../helpers/isModelCompatibleWithVision";

export const createChatMessageHandler = createActionHandler(createChatMessage, {
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
      model: createAnthropic({
        apiKey,
      })(modelName),
      variables,
      messages: options.systemMessage
        ? [
            {
              role: "system",
              content: options.systemMessage,
            },
            ...options.messages,
          ]
        : options.messages,
      tools: options.tools,
      isVisionEnabled: isModelCompatibleWithVision(modelName),
      temperature: options.temperature,
      responseMapping: options.responseMapping,
      logs,
      sessionStore,
    });
  },
  stream: {
    run: async ({
      credentials: { apiKey },
      options,
      variables,
      sessionStore,
    }) => {
      if (!apiKey)
        return {
          error: { description: "No API key provided" },
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
        model: createAnthropic({
          apiKey,
        })(modelName),
        variables,
        messages: options.systemMessage
          ? [
              {
                role: "system",
                content: options.systemMessage,
              },
              ...options.messages,
            ]
          : options.messages,
        isVisionEnabled: isModelCompatibleWithVision(modelName),
        tools: options.tools,
        temperature: options.temperature,
        responseMapping: options.responseMapping,
        sessionStore,
      });
    },
  },
});
