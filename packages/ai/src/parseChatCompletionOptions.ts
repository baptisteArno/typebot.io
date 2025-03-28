import { option } from "@typebot.io/forge";
import type { z } from "@typebot.io/zod";
import type { baseOptions } from "./legacy/chatCompletionBaseOptions";
import { toolsSchema } from "./schemas";

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
  models: {
    helperText?: string;
  } & (
    | { type: "fetcher"; id: string }
    | {
        type: "static";
        models: string[];
      }
    | { type: "text" }
  );
};

export const parseChatCompletionOptions = ({ models }: Props) =>
  option.object({
    model: option.string.layout({
      placeholder: "Select a model",
      label: "Model",
      allowCustomValue: true,
      helperText: models.helperText,
      autoCompleteItems: models.type === "static" ? models.models : undefined,
      fetcher: models.type === "fetcher" ? models.id : undefined,
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
      defaultValue: 1,
    }),
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

export type ChatCompletionOptions = z.infer<
  ReturnType<typeof parseChatCompletionOptions>
> &
  z.infer<typeof baseOptions>;
