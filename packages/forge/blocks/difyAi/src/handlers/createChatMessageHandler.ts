import { processDataStream } from "@ai-sdk/ui-utils";
import { runChatCompletionStream } from "@typebot.io/ai/runChatCompletionStream";
import { createActionHandler } from "@typebot.io/forge";
import type { GenerateTextEndEvent, ProviderMetadata, Tool } from "ai";
import { createDifyProvider } from "dify-ai-provider";
import { createChatMessage } from "../actions/createChatMessage";
import { defaultAppId, defaultUserId } from "../constants";
import { transformKeyValueListToObject } from "../helpers/transformKeyValueListToObject";
import { validateCredentials } from "../helpers/validateCredentials";

type ChatCompletionStreamResponse = GenerateTextEndEvent<Record<string, Tool>>;

export const createChatMessageHandler = createActionHandler(createChatMessage, {
  server: async ({
    credentials: { apiKey, apiEndpoint },
    options,
    variables,
    logs,
    sessionStore,
  }) => {
    const credentials = validateCredentials(apiEndpoint, apiKey);
    if (!credentials.success) return logs.add(credentials.error);

    const difyModel = createDifyProvider({
      baseURL: `${credentials.apiEndpoint}/v1`,
    })(defaultAppId, {
      apiKey: credentials.apiKey,
      inputs: transformKeyValueListToObject(options.inputs),
      responseMode: "blocking",
    });

    const { stream, error: initialError } = await runChatCompletionStream({
      model: difyModel,
      variables,
      responseMapping: options.responseMapping,
      sessionStore,
      tools: undefined,
      temperature: undefined,
      isVisionEnabled: false,
      headers: {
        "user-id": options.user ?? defaultUserId,
        "chat-id": options.conversationVariableId
          ? variables.get(options.conversationVariableId)?.toString()
          : undefined,
      },
      onFinish: (response: ChatCompletionStreamResponse) => {
        if (!options.conversationVariableId) return;
        const conversationId = parseDifyConversationId(
          response.providerMetadata,
        );
        if (!conversationId) return;

        variables.set([
          {
            id: options.conversationVariableId,
            value: conversationId,
          },
        ]);
      },
      messages: [
        {
          role: "user",
          content: options.query,
        },
      ],
    });

    if (!stream)
      return logs.add(initialError ?? { description: "No response from Dify" });

    let message = "";
    await processDataStream({
      stream,
      onTextPart: async (text) => {
        message += text;
      },
      onErrorPart: (error) => {
        logs.add(JSON.parse(error));
      },
    });

    options.responseMapping?.forEach((mapping) => {
      if (!mapping.variableId) return;
      if (!mapping.item || mapping.item === "Message content")
        variables.set([{ id: mapping.variableId, value: message }]);
    });
  },
  stream: {
    run: async ({
      credentials: { apiKey, apiEndpoint },
      options,
      variables,
      sessionStore,
    }) => {
      const credentials = validateCredentials(apiEndpoint, apiKey);
      if (!credentials.success)
        return { error: { description: credentials.error } };

      const difyModel = createDifyProvider({
        baseURL: `${credentials.apiEndpoint}/v1`,
      })(defaultAppId, {
        apiKey: credentials.apiKey,
        inputs: transformKeyValueListToObject(options.inputs),
        responseMode: "streaming",
      });

      return runChatCompletionStream({
        model: difyModel,
        variables,
        responseMapping: options.responseMapping,
        sessionStore,
        isVisionEnabled: false,
        tools: undefined,
        temperature: undefined,
        headers: {
          "user-id": options.user ?? defaultUserId,
          "chat-id": options.conversationVariableId
            ? variables.get(options.conversationVariableId)?.toString()
            : undefined,
        },
        messages: [
          {
            role: "user",
            content: options.query,
          },
        ],
        onFinish: (response: ChatCompletionStreamResponse) => {
          if (!options.conversationVariableId) return;
          const conversationId = parseDifyConversationId(
            response.providerMetadata,
          );
          if (!conversationId) return;

          variables.set([
            {
              id: options.conversationVariableId,
              value: conversationId,
            },
          ]);
        },
      });
    },
  },
});

const parseDifyConversationId = (
  providerMetadata: ProviderMetadata | undefined,
) => {
  const conversationId = providerMetadata?.difyWorkflowData?.conversationId;

  return typeof conversationId === "string" ? conversationId : undefined;
};
