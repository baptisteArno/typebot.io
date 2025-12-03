import { createOpenAI } from "@ai-sdk/openai";
import { runChatCompletion } from "@typebot.io/ai/runChatCompletion";
import { runChatCompletionStream } from "@typebot.io/ai/runChatCompletionStream";
import { createActionHandler } from "@typebot.io/forge";
import { createChatCompletion } from "../actions/createChatCompletion";
import { isModelCompatibleWithVision } from "../helpers/isModelCompatibleWithVision";

export const createChatCompletionHandler = createActionHandler(
  createChatCompletion,
  {
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
        sessionStore,
      });
    },
    stream: {
      run: async ({
        credentials: { apiKey, baseUrl },
        options,
        variables,
        sessionStore,
      }) => {
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
          sessionStore,
        });
      },
    },
  },
);
