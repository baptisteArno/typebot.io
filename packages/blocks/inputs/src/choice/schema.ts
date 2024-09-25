import {
  blockBaseSchema,
  itemBaseSchemas,
  optionBaseSchema,
} from "@typebot.io/blocks-base/schemas";
import { conditionSchema } from "@typebot.io/conditions/schemas";
import { z } from "@typebot.io/zod";
import { InputBlockType } from "../constants";

export const choiceInputOptionsSchema = optionBaseSchema.merge(
  z.object({
    isMultipleChoice: z.boolean().optional(),
    buttonLabel: z.string().optional(),
    dynamicVariableId: z.string().optional(),
    isSearchable: z.boolean().optional(),
    searchInputPlaceholder: z.string().optional(),
  }),
);

export const buttonItemSchemas = {
  v5: itemBaseSchemas.v5.extend({
    content: z.string().optional(),
    displayCondition: z
      .object({
        isEnabled: z.boolean().optional(),
        condition: conditionSchema.optional(),
      })
      .optional(),
  }),
  v6: itemBaseSchemas.v6.extend({
    content: z.string().optional(),
    displayCondition: z
      .object({
        isEnabled: z.boolean().optional(),
        condition: conditionSchema.optional(),
      })
      .optional(),
  }),
};

export const buttonItemSchema = z.union([
  buttonItemSchemas.v5,
  buttonItemSchemas.v6,
]);

export const buttonsInputV5Schema = blockBaseSchema.merge(
  z.object({
    type: z.enum([InputBlockType.CHOICE]),
    items: z.array(buttonItemSchemas.v5),
    options: choiceInputOptionsSchema.optional(),
  }),
);

export const buttonsInputSchemas = {
  v5: buttonsInputV5Schema.openapi({
    title: "Buttons v5",
    ref: "buttonsInputV5",
  }),
  v6: buttonsInputV5Schema
    .extend({
      items: z.array(buttonItemSchemas.v6),
    })
    .openapi({
      title: "Buttons",
      ref: "buttonsInput",
    }),
} as const;

export const buttonsInputSchema = z.union([
  buttonsInputSchemas.v5,
  buttonsInputSchemas.v6,
]);

export type ButtonItem = z.infer<typeof buttonItemSchema>;
export type ChoiceInputBlock = z.infer<typeof buttonsInputSchema>;
