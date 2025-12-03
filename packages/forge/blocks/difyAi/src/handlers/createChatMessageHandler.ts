import { runChatCompletion } from "@typebot.io/ai/runChatCompletion";
import { runChatCompletionStream } from "@typebot.io/ai/runChatCompletionStream";
import { createActionHandler } from "@typebot.io/forge";
import { createDifyProvider } from "dify-ai-provider";
import { createChatMessage } from "../actions/createChatMessage";
import { defaultAppId, defaultUserId } from "../constants";
import { transformKeyValueListToObject } from "../helpers/transformKeyValueListToObject";
import { validateCredentials } from "../helpers/validateCredentials";

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

    const response = await runChatCompletion({
      model: difyModel,
      variables,
      responseMapping: options.responseMapping,
      logs,
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
      messages: [
        {
          role: "user",
          content: options.query,
        },
      ],
    });

    if (!response)
      return logs.add({
        status: "error",
        description: "No response from Dify",
      });

    if (!options.conversationVariableId) return;
    variables.set([
      {
        id: options.conversationVariableId,
        value: response.providerMetadata?.difyWorkflowData
          .conversationId as string,
      },
    ]);
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
        onFinish: (response) => {
          if (!options.conversationVariableId) return;
          variables.set([
            {
              id: options.conversationVariableId,
              value: response.providerMetadata?.difyWorkflowData
                .conversationId as string,
            },
          ]);
        },
      });
    },
  },
});
