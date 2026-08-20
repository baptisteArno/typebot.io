import { runChatCompletion } from "@typebot.io/ai/runChatCompletion";
import { runChatCompletionStream } from "@typebot.io/ai/runChatCompletionStream";
import { createActionHandler, createFetcherHandler } from "@typebot.io/forge";
import { safeKy } from "@typebot.io/lib/ky";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import {
  createChatCompletion,
  modelsFetcher,
} from "./actions/createChatCompletion";
import { defaultBaseUrl } from "./constants";
import { createGroqChatLanguageModel } from "./createGroqChatLanguageModel";

export default [
  createActionHandler(createChatCompletion, {
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
        model: createGroqChatLanguageModel({
          apiKey,
          baseUrl,
          modelName,
        }),
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
          model: createGroqChatLanguageModel({
            apiKey,
            baseUrl,
            modelName,
          }),
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
  }),
  createFetcherHandler(
    createChatCompletion,
    modelsFetcher.id,
    async ({ credentials }) => {
      if (!credentials?.apiKey)
        return {
          data: [],
        };

      try {
        const baseUrl = credentials.baseUrl ?? defaultBaseUrl;
        const response = await safeKy
          .get(`${baseUrl.replace(/\/$/, "")}/models`, {
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
  ),
];
