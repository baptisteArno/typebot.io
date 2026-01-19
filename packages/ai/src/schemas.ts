import { option } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import { z } from "zod";

const parameterBase = {
  name: option.string.meta({
    layout: {
      label: "Name",
      placeholder: "myVariable",
      withVariableButton: false,
    },
  }),
  description: option.string.meta({
    layout: {
      label: "Description",
      withVariableButton: false,
    },
  }),
  required: option.boolean.meta({
    layout: {
      label: "Is required?",
    },
  }),
};

export const toolParametersSchema = option
  .array(
    option.discriminatedUnion("type", [
      option
        .object({
          type: option.literal("string"),
        })
        .extend(parameterBase),
      option
        .object({
          type: option.literal("number"),
        })
        .extend(parameterBase),
      option
        .object({
          type: option.literal("boolean"),
        })
        .extend(parameterBase),
      option
        .object({
          type: option.literal("enum"),
          values: option
            .array(option.string)
            .meta({ layout: { itemLabel: "possible value" } }),
        })
        .extend(parameterBase),
    ]),
  )
  .meta({
    layout: {
      accordion: "Parameters",
      itemLabel: "parameter",
    },
  });

const functionToolItemSchema = option.object({
  type: option.literal("function"),
  name: option.string.meta({
    layout: {
      label: "Name",
      placeholder: "myFunctionName",
      withVariableButton: false,
    },
  }),
  description: option.string.meta({
    layout: {
      label: "Description",
      placeholder: "A brief description of what this function does.",
      withVariableButton: false,
    },
  }),
  parameters: toolParametersSchema,
  code: option.string.meta({
    layout: {
      inputType: "code",
      label: "Code",
      lang: "javascript",
      moreInfoTooltip:
        "A javascript code snippet that can use the defined parameters. It should return a value.",
      withVariableButton: false,
    },
  }),
});

const normalizeToolsInput = (value: unknown) => {
  if (!Array.isArray(value)) return value;
  return value.map(normalizeToolItem).filter(isDefined);
};

export const toolsSchema = z
  .preprocess(
    normalizeToolsInput,
    option.array(option.discriminatedUnion("type", [functionToolItemSchema])),
  )
  .meta({ layout: { accordion: "Tools", itemLabel: "tool" } });

export type Tools = z.infer<typeof toolsSchema>;

const normalizeToolItem = (item: unknown) => {
  if (!isRecord(item)) return undefined;
  if (typeof item.type === "string") return item;
  return { ...item, type: "function" };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
