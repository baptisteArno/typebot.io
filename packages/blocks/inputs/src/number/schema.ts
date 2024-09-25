import {
  blockBaseSchema,
  optionBaseSchema,
} from "@typebot.io/blocks-base/schemas";
import { variableStringSchema } from "@typebot.io/variables/schemas";
import { z } from "@typebot.io/zod";
import { InputBlockType } from "../constants";
import { textInputOptionsBaseSchema } from "../text/schema";

export const numberInputOptionsSchema = optionBaseSchema
  .merge(textInputOptionsBaseSchema)
  .merge(
    z.object({
      min: z.number().or(variableStringSchema).optional(),
      max: z.number().or(variableStringSchema).optional(),
      step: z.number().or(variableStringSchema).optional(),
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
