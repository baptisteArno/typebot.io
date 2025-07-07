import { getChatCompletionStreamVarId } from "@typebot.io/ai/getChatCompletionStreamVarId";
import { runChatCompletion } from "@typebot.io/ai/runChatCompletion";
import { runChatCompletionStream } from "@typebot.io/ai/runChatCompletionStream";
import { createAction, option } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import { createDifyProvider } from "dify-ai-provider";
import { auth } from "../auth";

type InputItem = { key?: string; value?: any };

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
  if (!apiEndpoint)
    return { success: false, error: "No API Endpoint provided" };

  if (!apiKey) return { success: false, error: "No API key provided" };

  const trimmedApplicationId = applicationId?.trim();
  if (!trimmedApplicationId)
    return { success: false, error: "No applicationId provided" };

  return {
    success: true,
    applicationId: trimmedApplicationId,
    apiKey,
    apiEndpoint,
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

const options = option.object({
  applicationId: option.string.layout({
    placeholder: "Fill the applicationId",
    helperText: "Dify Application ID",
    allowCustomValue: true,
    label: "Application ID",
  }),
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
  responseMapping: option
    .saveResponseArray([
      "Message content",
      "Total tokens",
      "Prompt tokens",
      "Completion tokens",
    ] as const)
    .layout({
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
      credentials: { apiKey, apiEndpoint },
      options,
      variables,
      logs,
      sessionStore,
    }) => {
      const validation = validateCredentials(
        apiEndpoint,
        apiKey,
        options.applicationId,
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
        responseMapping: options.responseMapping,
        logs,
        sessionStore,
        isVisionEnabled: false,
        messages: [
          {
            role: "user",
            content: options.query,
          },
        ],
        temperature: undefined,
        tools: undefined,
      });
    },
    stream: {
      getStreamVariableId: getChatCompletionStreamVarId,
      run: async ({
        credentials: { apiKey, apiEndpoint },
        options,
        variables,
        sessionStore,
      }) => {
        const validation = validateCredentials(
          apiEndpoint,
          apiKey,
          options.applicationId,
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
          responseMapping: options.responseMapping,
          sessionStore,
          isVisionEnabled: false,
          messages: [
            {
              role: "user",
              content: options.query,
            },
          ],
          temperature: undefined,
          tools: undefined,
        });
      },
    },
  },
});
