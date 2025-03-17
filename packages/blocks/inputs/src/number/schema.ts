import {
  blockBaseSchema,
  optionBaseSchema,
} from "@typebot.io/blocks-base/schemas";
import { singleVariableOrNumberSchema } from "@typebot.io/variables/schemas";
import { z } from "@typebot.io/zod";
import { InputBlockType } from "../constants";
import { textInputOptionsBaseSchema } from "../text/schema";
import { NumberInputStyle } from "./constants";

const supportedCurrencies = Intl.supportedValuesOf
  ? Intl.supportedValuesOf("currency")
  : [];

const supportedUnits = Intl.supportedValuesOf
  ? Intl.supportedValuesOf("unit")
  : [];

export const numberInputOptionsSchema = optionBaseSchema
  .merge(textInputOptionsBaseSchema)
  .merge(
    z.object({
      min: singleVariableOrNumberSchema.optional(),
      max: singleVariableOrNumberSchema.optional(),
      step: singleVariableOrNumberSchema.optional(),
      locale: z.string().optional(),
      style: z.nativeEnum(NumberInputStyle).optional(),
      currency:
        supportedCurrencies.length > 0
          ? z.enum(supportedCurrencies as [string, ...string[]]).optional()
          : z.string().optional(),
      unit:
        supportedUnits.length > 0
          ? z.enum(supportedUnits as [string, ...string[]]).optional()
          : z.string().optional(),
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
