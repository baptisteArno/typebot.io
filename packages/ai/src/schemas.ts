import { option } from "@typebot.io/forge";
import type { z } from "zod";

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

export const toolsSchema = option
  .array(option.discriminatedUnion("type", [functionToolItemSchema]))
  .meta({ layout: { accordion: "Tools", itemLabel: "tool" } });

export type Tools = z.infer<typeof toolsSchema>;
