import { getChatCompletionStreamVarId } from "@typebot.io/ai/getChatCompletionStreamVarId";
import { toolsSchema } from "@typebot.io/ai/schemas";
import { createAction, option } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import { z } from "@typebot.io/zod";
import { auth } from "../auth";
import { anthropicModels, defaultAnthropicMaxTokens } from "../constants";

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
  model: option.string.layout({
    placeholder: "Select a model",
    autoCompleteItems: anthropicModels,
    label: "Model",
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
    placeholder: "1",
  }),
  maxTokens: option.number.layout({
    accordion: "Advanced Settings",
    label: "Max Tokens",
    direction: "row",
    defaultValue: defaultAnthropicMaxTokens,
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
  getStreamVariableId: getChatCompletionStreamVarId,
});
