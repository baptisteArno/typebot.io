import { getChatCompletionStreamVarId } from "@typebot.io/ai/getChatCompletionStreamVarId";
import { runChatCompletion } from "@typebot.io/ai/runChatCompletion";
import { runChatCompletionStream } from "@typebot.io/ai/runChatCompletionStream";
import { createAction, option } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import { createDifyProvider } from "dify-ai-provider";
import { auth } from "../auth";

const convertNonMarkdownLinks = (text: string) => {
  const nonMarkdownLinks = /(?<![\([])https?:\/\/\S+/g;
  return text.replace(nonMarkdownLinks, (match) => `[${match}](${match})`);
};

type InputItem = { key?: string; value?: any };

const toInputsObject = (inputs?: InputItem[]): Record<string, any> => {
  const result: Record<string, any> = {};

  inputs?.forEach(({ key, value }) => {
    if (key) result[key] = value;
  });

  return result;
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

const transformToChatCompletionOptions = (
  options: any,
  resetModel = false,
) => ({
  ...options,
  model: resetModel ? undefined : options.model,
  action: "Create chat message",
});

export const createChatMessage = createAction({
  name: "Create Chat Message",
  auth,
  options,
  turnableInto: [
    {
      blockId: "mistral",
      transform: (opts) => transformToChatCompletionOptions(opts, true),
    },
    {
      blockId: "openai",
      transform: (opts) => transformToChatCompletionOptions(opts, true),
    },
    {
      blockId: "deepseek",
      transform: (opts) => transformToChatCompletionOptions(opts, true),
    },
    {
      blockId: "perplexity",
      transform: (opts) => transformToChatCompletionOptions(opts, true),
    },
    { blockId: "open-router", transform: transformToChatCompletionOptions },
    { blockId: "together-ai", transform: transformToChatCompletionOptions },
    {
      blockId: "dify-ai",
      transform: (opts) => transformToChatCompletionOptions(opts, false),
    },
  ],
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
      if (!apiKey) return logs.add("No API key provided");
      const applicationId = options.applicationId?.trim();
      if (!applicationId) return logs.add("No applicationId provided");

      const difyProvider = createDifyProvider({
        baseURL: `${apiEndpoint}/v1`,
      });
      const difyModel = difyProvider(applicationId, {
        apiKey,
        inputs: toInputsObject(options.inputs),
        responseMode: "blocking",
      });

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
        if (!apiKey) return { error: { description: "No API key provided" } };

        const applicationId = options.applicationId?.trim();
        if (!applicationId)
          return { error: { description: "No ApplicationID provided" } };

        const difyProvider = createDifyProvider({
          baseURL: `${apiEndpoint}/v1`,
        });
        const difyModel = difyProvider(applicationId, {
          apiKey,
          inputs: toInputsObject(options.inputs),
          responseMode: "streaming",
        });

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
