import { toolsSchema } from "@typebot.io/ai/schemas";
import { option } from "@typebot.io/forge";
import type { z } from "@typebot.io/zod";
import type { baseOptions } from "../baseOptions";

const nativeMessageContentSchema = {
  content: option.string.layout({
    inputType: "textarea",
    placeholder: "Content",
  }),
};

const systemMessageItemSchema = option
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

type Props = {
  defaultTemperature: number;
  modelFetchId?: string;
  modelHelperText?: string;
};

export const parseChatCompletionOptions = ({
  defaultTemperature,
  modelFetchId,
  modelHelperText,
}: Props) =>
  option.object({
    model: option.string.layout({
      placeholder: modelFetchId ? "Select a model" : undefined,
      label: modelFetchId ? undefined : "Model",
      fetcher: modelFetchId,
      helperText: modelHelperText,
    }),
    messages: option
      .array(
        option.discriminatedUnion("role", [
          systemMessageItemSchema,
          userMessageItemSchema,
          assistantMessageItemSchema,
          dialogueMessageItemSchema,
        ]),
      )
      .layout({ accordion: "Messages", itemLabel: "message", isOrdered: true }),
    tools: toolsSchema,
    temperature: option.number.layout({
      accordion: "Advanced settings",
      label: "Temperature",
      direction: "row",
      defaultValue: defaultTemperature,
    }),
    responseMapping: option
      .saveResponseArray(["Message content", "Total tokens"] as const)
      .layout({
        accordion: "Save response",
      }),
  });

export type ChatCompletionOptions = z.infer<
  ReturnType<typeof parseChatCompletionOptions>
> &
  z.infer<typeof baseOptions>;
