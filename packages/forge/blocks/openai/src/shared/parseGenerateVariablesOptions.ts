import { option } from "@typebot.io/forge";
import type { z } from "@typebot.io/zod";
import type { baseOptions } from "../baseOptions";

const extractInfoBaseShape = {
  variableId: option.string.layout({
    inputType: "variableDropdown",
  }),
  description: option.string.layout({
    label: "Description",
    accordion: "Advanced",
  }),
  isRequired: option.boolean.layout({
    label: "Is required",
    moreInfoTooltip:
      "If set to false, there is a chance the variable will be empty",
    accordion: "Advanced",
    defaultValue: true,
  }),
};

export const toolParametersSchema = option
  .array(
    option.discriminatedUnion("type", [
      option
        .object({
          type: option.literal("string"),
        })
        .extend(extractInfoBaseShape),
      option
        .object({
          type: option.literal("number"),
        })
        .extend(extractInfoBaseShape),
      option
        .object({
          type: option.literal("boolean"),
        })
        .extend(extractInfoBaseShape),
      option
        .object({
          type: option.literal("enum"),
          values: option
            .array(option.string)
            .layout({ itemLabel: "possible value", mergeWithLastField: true }),
        })
        .extend(extractInfoBaseShape),
    ]),
  )
  .layout({
    itemLabel: "variable mapping",
    accordion: "Schema",
  });

type Props = {
  defaultModel?: string;
  modelFetch: string | readonly [string, ...string[]];
  modelHelperText?: string;
};

export const parseGenerateVariablesOptions = ({
  defaultModel,
  modelFetch,
  modelHelperText,
}: Props) =>
  option.object({
    model:
      typeof modelFetch === "string"
        ? option.string.layout({
            placeholder: "Select a model",
            label: "Model",
            fetcher: modelFetch,
            helperText: modelHelperText,
          })
        : option.enum(modelFetch).layout({
            placeholder: "Select a model",
            label: "Model",
            helperText: modelHelperText,
          }),
    prompt: option.string.layout({
      label: "Prompt",
      placeholder: "Type your text here",
      inputType: "textarea",
      isRequired: true,
      moreInfoTooltip:
        'Meant to guide the model on what to generate. i.e. "Generate a role-playing game character", "Extract the company name from this text", etc.',
    }),
    variablesToExtract: toolParametersSchema,
  });

export type GenerateVariablesOptions = z.infer<
  ReturnType<typeof parseGenerateVariablesOptions>
> &
  z.infer<typeof baseOptions>;
