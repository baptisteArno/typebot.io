import { getChatCompletionStreamVarId } from "@typebot.io/ai/getChatCompletionStreamVarId";
import { runChatCompletion } from "@typebot.io/ai/runChatCompletion";
import { runChatCompletionStream } from "@typebot.io/ai/runChatCompletionStream";
import { createAction, option } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import { createDifyProvider } from "dify-ai-provider";
import { auth } from "../auth";

type InputItem = { key?: string; value?: any };

const LEGACY_RESPONSE_MAPPING = [
  "Answer",
  "Conversation ID",
  "Total Tokens",
] as const;

const NEW_RESPONSE_MAPPING = [
  "Message content",
  "Total tokens",
  "Prompt tokens",
  "Completion tokens",
] as const;

const COMBINED_RESPONSE_MAPPING = [
  ...LEGACY_RESPONSE_MAPPING,
  ...NEW_RESPONSE_MAPPING,
] as const;

const LEGACY_TO_NEW_MAPPING = {
  Answer: "Message content",
  "Total Tokens": "Total tokens",
  "Conversation ID": "Conversation ID",
} as const;

const normalizeResponseMappingItem = (item: string): string => {
  return (
    LEGACY_TO_NEW_MAPPING[item as keyof typeof LEGACY_TO_NEW_MAPPING] || item
  );
};

// Not sure if this is the best way to handle the backward compatibility
const getCompatibleStreamVariableId = (options: any): string | undefined => {
  const normalizedOptions = {
    ...options,
    responseMapping: normalizeResponseMappingForAI(options.responseMapping),
  };

  return getChatCompletionStreamVarId(normalizedOptions);
};

const toInputsObject = (inputs?: InputItem[]): Record<string, any> => {
  const result: Record<string, any> = {};

  inputs?.forEach(({ key, value }) => {
    if (key) result[key] = value;
  });

  return result;
};

const validateCredentials = (
  apiEndpoint: string | undefined,
  apiKey: string | undefined,
  applicationId: string | undefined,
):
  | {
      success: true;
      applicationId: string;
      apiKey: string;
      apiEndpoint: string;
    }
  | { success: false; error: string } => {
  if (!apiEndpoint?.trim())
    return { success: false, error: "No API Endpoint provided" };

  if (!apiKey?.trim()) return { success: false, error: "No API key provided" };

  const resolvedApplicationId = applicationId?.trim() || "default-app-id";

  return {
    success: true,
    applicationId: resolvedApplicationId,
    apiKey: apiKey.trim(),
    apiEndpoint: apiEndpoint.trim(),
  };
};

const createDifyModelInstance = (
  apiEndpoint: string,
  applicationId: string,
  apiKey: string,
  inputs: InputItem[] | undefined,
  responseMode: "blocking" | "streaming",
) => {
  const difyProvider = createDifyProvider({
    baseURL: `${apiEndpoint}/v1`,
  });
  return difyProvider(applicationId, {
    apiKey,
    inputs: toInputsObject(inputs),
    responseMode,
  });
};

const normalizeResponseMappingForAI = (
  responseMapping: Array<{ item?: string; variableId?: string }> | undefined,
):
  | Array<{
      item?:
        | "Message content"
        | "Total tokens"
        | "Prompt tokens"
        | "Completion tokens";
      variableId?: string;
    }>
  | undefined => {
  if (!responseMapping) return undefined;

  return responseMapping
    .map((mapping) => ({
      ...mapping,
      item: mapping.item
        ? (normalizeResponseMappingItem(mapping.item) as any)
        : undefined,
    }))
    .filter(
      (mapping) =>
        !mapping.item || NEW_RESPONSE_MAPPING.includes(mapping.item as any),
    );
};

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
  }),
  inputs: option
    .array(
      option.object({
        key: option.string.layout({ label: "Key" }),
        value: option.string.layout({ label: "Value" }),
      }),
    )
    .layout({ accordion: "Inputs" }),
  responseMapping: option.saveResponseArray(COMBINED_RESPONSE_MAPPING).layout({
    accordion: "Save response",
  }),
});

export const createChatMessage = createAction({
  name: "Create Chat Message",
  auth,
  options,
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((res) => res.variableId).filter(isDefined) ?? [],
  run: {
    server: ({
      credentials: { apiKey, apiEndpoint, applicationId },
      options,
      variables,
      logs,
      sessionStore,
    }) => {
      const validation = validateCredentials(
        apiEndpoint,
        apiKey,
        applicationId,
      );
      if (!validation.success) return logs.add(validation.error);

      const difyModel = createDifyModelInstance(
        validation.apiEndpoint,
        validation.applicationId,
        validation.apiKey,
        options.inputs,
        "blocking",
      );

      return runChatCompletion({
        model: difyModel,
        variables,
        responseMapping: normalizeResponseMappingForAI(options.responseMapping),
        logs,
        sessionStore,
        isVisionEnabled: false,
        messages: [
          {
            role: "user",
            content: options.query,
          },
        ],
      });
    },
    stream: {
      getStreamVariableId: getCompatibleStreamVariableId,
      run: async ({
        credentials: { apiKey, apiEndpoint, applicationId },
        options,
        variables,
        sessionStore,
      }) => {
        const validation = validateCredentials(
          apiEndpoint,
          apiKey,
          applicationId,
        );
        if (!validation.success)
          return { error: { description: validation.error } };

        const difyModel = createDifyModelInstance(
          validation.apiEndpoint,
          validation.applicationId,
          validation.apiKey,
          options.inputs,
          "streaming",
        );

        return runChatCompletionStream({
          model: difyModel,
          variables,
          responseMapping: normalizeResponseMappingForAI(
            options.responseMapping,
          ),
          sessionStore,
          isVisionEnabled: false,
          messages: [
            {
              role: "user",
              content: options.query,
            },
          ],
        });
      },
    },
  },
});
