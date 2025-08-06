import { chatCompletionResponseValues } from "@typebot.io/ai/constants";
import { runChatCompletion } from "@typebot.io/ai/runChatCompletion";
import { runChatCompletionStream } from "@typebot.io/ai/runChatCompletionStream";
import { createAction, option } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import { createDifyProvider } from "dify-ai-provider";
import { auth } from "../auth";
import {
  LEGACY_RESPONSE_MAPPING,
  defaultAppId,
  defaultUserId,
} from "../constants";
import { transformKeyValueListToObject } from "../helpers/transformKeyValueListToObject";
import { transformLegacyResponseMapping } from "../helpers/transformLegacyResponseMapping";
import { validateCredentials } from "../helpers/validateCredentials";

const options = option.object({
  query: option.string.layout({
    label: "Query",
    placeholder: "User input/question content",
    inputType: "textarea",
    isRequired: true,
  }),
  conversationVariableId: option.string.layout({
    label: "Conversation ID",
    moreInfoTooltip:
      "Used to remember the conversation with the user. If empty, a new conversation ID is created.",
    inputType: "variableDropdown",
  }),
  user: option.string.layout({
    label: "User",
    moreInfoTooltip:
      "The user identifier, defined by the developer, must ensure uniqueness within the app.",
    isHidden: true,
  }),
  inputs: option
    .array(
      option.object({
        key: option.string.layout({ label: "Key" }),
        value: option.string.layout({ label: "Value" }),
      }),
    )
    .layout({ accordion: "Inputs" }),
  responseMapping: option
    .saveResponseArray(
      [...LEGACY_RESPONSE_MAPPING, ...chatCompletionResponseValues],
      {
        item: {
          hiddenItems: LEGACY_RESPONSE_MAPPING,
        },
      },
    )
    .layout({
      accordion: "Save response",
    })
    .transform(transformLegacyResponseMapping)
    .openapi({
      effectType: "input",
    }),
});

export const createChatMessage = createAction({
  name: "Create Chat Message",
  auth,
  options,
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((res) => res.variableId).filter(isDefined) ?? [],
  run: {
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
      getStreamVariableId: ({ responseMapping }) =>
        responseMapping?.find((res) => res.item === "Message content")
          ?.variableId,
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
  },
});
