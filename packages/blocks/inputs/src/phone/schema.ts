import {
  blockBaseSchema,
  optionBaseSchema,
} from "@typebot.io/blocks-base/schemas";
import { z } from "@typebot.io/zod";
import { InputBlockType } from "../constants";
import { textInputOptionsBaseSchema } from "../text/schema";

export const phoneNumberInputOptionsSchema = optionBaseSchema
  .merge(textInputOptionsBaseSchema)
  .merge(
    z.object({
      retryMessageContent: z.string().optional(),
      defaultCountryCode: z.string().optional(),
    }),
  );

export const phoneNumberInputBlockSchema = blockBaseSchema
  .merge(
    z.object({
      type: z.enum([InputBlockType.PHONE]),
      options: phoneNumberInputOptionsSchema.optional(),
    }),
  )
  .openapi({
    title: "Phone number",
    ref: "phoneNumberInput",
  });

export type PhoneNumberInputBlock = z.infer<typeof phoneNumberInputBlockSchema>;
