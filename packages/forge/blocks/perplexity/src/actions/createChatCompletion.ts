import { runChatCompletion } from "@typebot.io/ai/runChatCompletion";
import { toolsSchema } from "@typebot.io/ai/schemas";
import { createAction } from "@typebot.io/forge";
import { option } from "@typebot.io/forge";
import { z } from "@typebot.io/zod";
import { isDefined } from "../../../../../lib/src/utils";
import { auth } from "../auth";
import { defaultPerplexityOptions, perplexityModels } from "../constants";
import { runApiChatCompletion } from "../helpers/runApiChatCompletion";

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
        userMessageItemSchema,
        assistantMessageItemSchema,
        dialogueMessageItemSchema,
      ]),
    )
    .layout({ accordion: "Messages", itemLabel: "message", isOrdered: true }),
  // tools: toolsSchema,
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
  responseMapping: option
    .saveResponseArray(["Message content", "Total tokens"] as const)
    .layout({ accordion: "Save response" }),
});

export const createChatCompletion = createAction({
  name: "Create chat completion",
  auth,
  options,
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((res) => res.variableId).filter(isDefined) ?? [],
  run: {
    server: ({ credentials: { apiKey }, options, variables, logs }) => {
      if (!apiKey) return logs.add("No API key provided");
      const modelName = options.model?.trim();
      if (!modelName) return logs.add("No model provided");
      if (!options.messages) return logs.add("No messages provided");

      return runApiChatCompletion({
        model: modelName,
        variables,
        messages: options.messages,
        // tools: options.tools,
        isVisionEnabled: false,
        temperature: options.temperature
          ? Number(options.temperature)
          : undefined,
        logs,
        responseMapping: options.responseMapping,
        apiKey,
      });
    },
  },
});
