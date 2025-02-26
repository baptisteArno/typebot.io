import {
  blockBaseSchema,
  optionBaseSchema,
} from "@typebot.io/blocks-base/schemas";
import { singleVariableOrNumberSchema } from "@typebot.io/variables/schemas";
import { z } from "@typebot.io/zod";
import { InputBlockType } from "../constants";
import { textInputOptionsBaseSchema } from "../text/schema";

export const numberInputOptionsSchema = optionBaseSchema
  .merge(textInputOptionsBaseSchema)
  .merge(
    z.object({
      min: singleVariableOrNumberSchema.optional(),
      max: singleVariableOrNumberSchema.optional(),
      step: singleVariableOrNumberSchema.optional(),
    }),
  );

export const numberInputSchema = blockBaseSchema
  .merge(
    z.object({
      type: z.enum([InputBlockType.NUMBER]),
      options: numberInputOptionsSchema.optional(),
    }),
  )
  .openapi({
    title: "Number",
    ref: "numberInput",
  });

export type NumberInputBlock = z.infer<typeof numberInputSchema>;
