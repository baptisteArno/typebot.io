import { option } from "@typebot.io/forge";
import type { z } from "zod";
import type { baseOptions } from "./legacy/chatCompletionBaseOptions";

const extractInfoBaseShape = {
  variableId: option.string.meta({
    layout: {
      inputType: "variableDropdown",
    },
  }),
  description: option.string.meta({
    layout: {
      label: "Description",
      accordion: "Advanced",
    },
  }),
  isRequired: option.boolean.meta({
    layout: {
      label: "Is required",
      moreInfoTooltip:
        "If set to false, there is a chance the variable will be empty",
      accordion: "Advanced",
      defaultValue: true,
    },
  }),
};

export const variablesToExtractSchema = option
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
          type: option.literal("array"),
        })
        .extend(extractInfoBaseShape),
      option
        .object({
          type: option.literal("enum"),
          values: option.array(option.string).meta({
            layout: { itemLabel: "possible value", mergeWithLastField: true },
          }),
        })
        .extend(extractInfoBaseShape),
    ]),
  )
  .meta({
    layout: {
      itemLabel: "variable mapping",
      accordion: "Schema",
    },
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
  );
};

export const parseGenerateVariablesOptions = ({ models }: Props) =>
  option.object({
    model: option.string.meta({
      layout: {
        placeholder: "Select a model",
        label: "Model",
        helperText: models.helperText,
        autoCompleteItems: models.type === "static" ? models.models : undefined,
        fetcher: models.type === "fetcher" ? models.id : undefined,
      },
    }),
    prompt: option.string.meta({
      layout: {
        label: "Prompt",
        placeholder: "Type your text here",
        inputType: "textarea",
        isRequired: true,
        moreInfoTooltip:
          'Meant to guide the model on what to generate. i.e. "Generate a role-playing game character", "Extract the company name from this text", etc.',
      },
    }),
    variablesToExtract: variablesToExtractSchema,
  });

export type GenerateVariablesOptions = z.infer<
  ReturnType<typeof parseGenerateVariablesOptions>
> &
  z.infer<typeof baseOptions>;
