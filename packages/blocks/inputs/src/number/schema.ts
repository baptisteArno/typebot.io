import {
  blockBaseSchema,
  optionBaseSchema,
} from "@typebot.io/blocks-base/schemas";
import { singleVariableOrNumberSchema } from "@typebot.io/variables/schemas";
import { z } from "@typebot.io/zod";
import { InputBlockType } from "../constants";
import { textInputOptionsBaseSchema } from "../text/schema";
import { localeRegex, NumberInputStyle, NumberInputUnit } from "./constants";

export const numberInputOptionsSchema = optionBaseSchema
  .merge(textInputOptionsBaseSchema)
  .merge(
    z.object({
      min: singleVariableOrNumberSchema.optional(),
      max: singleVariableOrNumberSchema.optional(),
      step: singleVariableOrNumberSchema.optional(),
      locale: z
        .string()
        .regex(localeRegex, {
          message: "Invalid locale format. Expected format: 'en' or 'en-US'",
        })
        .optional(),
      style: z.nativeEnum(NumberInputStyle).optional(),
      currency: z.string().optional(),
      unit: z.nativeEnum(NumberInputUnit).optional(),
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
