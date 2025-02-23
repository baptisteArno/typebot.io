import { createPerplexity, perplexity } from "@ai-sdk/perplexity";
import { getChatCompletionSetVarIds } from "@typebot.io/ai/getChatCompletionSetVarIds";
import { runChatCompletion } from "@typebot.io/ai/runChatCompletion";
import { createAction, option } from "@typebot.io/forge";
import { z } from "@typebot.io/zod";
import { auth } from "../auth";
import { defaultPerplexityOptions, perplexityModels } from "../constants";

const nativeMessageContentSchema = {
  content: option.string.layout({
    inputType: "textarea",
    placeholder: "Content",
  }),
};

const systemMeesageItemSchema = option
  .object({
    role: option.literal("system"),
  })
  .extend(nativeMessageContentSchema);

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
  model: option.enum(perplexityModels).layout({
    placeholder: "Select a model",
    toLabels: (val) => (val ? val : undefined),
  }),
  messages: option
    .array(
      option.discriminatedUnion("role", [
        systemMeesageItemSchema,
        userMessageItemSchema,
        assistantMessageItemSchema,
        dialogueMessageItemSchema,
      ]),
    )
    .layout({ accordion: "Messages", itemLabel: "message", isOrdered: true }),
  temperature: option.number.layout({
    accordion: "Advanced Settings",
    label: "Temperature",
    direction: "row",
    defaultValue: defaultPerplexityOptions.temperature,
  }),
  maxTokens: option.number.layout({
    accordion: "Advanced Settings",
    label: "Max Tokens",
    direction: "row",
    defaultValue: defaultPerplexityOptions.maxTokens,
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

export const createChatCompletion = createAction({
  name: "Create chat completion",
  auth,
  options,
  turnableInto: [
    {
      blockId: "mistral",
      transform: (opts) => ({
        ...opts,
        model: undefined,
      }),
    },
    {
      blockId: "openai",
      transform: (opts) => ({
        ...opts,
        model: undefined,
      }),
    },
    { blockId: "open-router" },
    { blockId: "together-ai" },
  ],
  getSetVariableIds: getChatCompletionSetVarIds,
  run: {
    server: ({ credentials: { apiKey }, options, variables, logs }) => {
      if (!apiKey) return logs.add("No API key provided");
      const modelName = options.model?.trim();
      if (!modelName) return logs.add("No model provided");
      if (!options.messages) return logs.add("No messages provided");

      return runChatCompletion({
        model: createPerplexity({
          apiKey,
        })(modelName),
        variables,
        messages: options.messages,
        isVisionEnabled: false,
        temperature: options.temperature
          ? Number(options.temperature)
          : undefined,
        responseMapping: options.responseMapping,
        logs,
        tools: undefined,
      });
    },
  },
});
