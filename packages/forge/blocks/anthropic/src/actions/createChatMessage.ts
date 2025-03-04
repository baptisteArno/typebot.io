import { createAnthropic } from "@ai-sdk/anthropic";
import { getChatCompletionStreamVarId } from "@typebot.io/ai/getChatCompletionStreamVarId";
import { runChatCompletion } from "@typebot.io/ai/runChatCompletion";
import { runChatCompletionStream } from "@typebot.io/ai/runChatCompletionStream";
import { toolsSchema } from "@typebot.io/ai/schemas";
import { createAction, option } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import { z } from "@typebot.io/zod";
import { auth } from "../auth";
import {
  anthropicLegacyModels,
  anthropicModelLabels,
  anthropicModels,
  defaultAnthropicOptions,
} from "../constants";
import { isModelCompatibleWithVision } from "../helpers/isModelCompatibleWithVision";

const nativeMessageContentSchema = {
  content: option.string.layout({
    inputType: "textarea",
    placeholder: "Content",
  }),
};

const userMessageItemSchema = option
  .object({
    role: option.literal("user"),
  })
  .extend(nativeMessageContentSchema);

const assistantMessageItemSchema = option
  .object({
    role: option.literal("assistant"),
  })
  .extend(nativeMessageContentSchema);

const dialogueMessageItemSchema = option.object({
  role: option.literal("Dialogue"),
  dialogueVariableId: option.string.layout({
    inputType: "variableDropdown",
    placeholder: "Dialogue variable",
  }),
  startsBy: option.enum(["user", "assistant"]).layout({
    label: "starts by",
    direction: "row",
    defaultValue: "user",
  }),
});

export const options = option.object({
  model: option.enum(anthropicModels).layout({
    toLabels: (val) =>
      val
        ? anthropicModelLabels[val as (typeof anthropicModels)[number]]
        : undefined,
    hiddenItems: anthropicLegacyModels,
    placeholder: "Select a model",
  }),
  messages: option
    .array(
      option.discriminatedUnion("role", [
        userMessageItemSchema,
        assistantMessageItemSchema,
        dialogueMessageItemSchema,
      ]),
    )
    .layout({ accordion: "Messages", itemLabel: "message", isOrdered: true }),
  tools: toolsSchema,
  systemMessage: option.string.layout({
    accordion: "Advanced Settings",
    label: "System prompt",
    direction: "row",
    inputType: "textarea",
  }),
  temperature: option.number.layout({
    accordion: "Advanced Settings",
    label: "Temperature",
    direction: "row",
    defaultValue: defaultAnthropicOptions.temperature,
  }),
  maxTokens: option.number.layout({
    accordion: "Advanced Settings",
    label: "Max Tokens",
    direction: "row",
    defaultValue: defaultAnthropicOptions.maxTokens,
  }),
  responseMapping: z.preprocess(
    (val) =>
      Array.isArray(val)
        ? val.map((res) =>
            res.item === "Message Content"
              ? { ...res, item: "Message content" }
              : res,
          )
        : undefined,
    option.saveResponseArray(["Message content"] as const).layout({
      accordion: "Save Response",
    }),
  ),
});

const transformToChatCompletionOptions = (
  options: any,
  resetModel = false,
) => ({
  ...options,
  model: resetModel ? undefined : options.model,
  action: "Create chat completion",
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
  ],
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((res) => res.variableId).filter(isDefined) ?? [],
  run: {
    server: ({ credentials: { apiKey }, options, variables, logs }) => {
      if (!apiKey) return logs.add("No API key provided");
      const modelName = options.model?.trim();
      if (!modelName) return logs.add("No model provided");
      if (!options.messages) return logs.add("No messages provided");

      return runChatCompletion({
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
      });
    },
    stream: {
      getStreamVariableId: getChatCompletionStreamVarId,
      run: async ({ credentials: { apiKey }, options, variables }) => {
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
        });
      },
    },
  },
});
