import {
  blockBaseSchema,
  optionBaseSchema,
} from "@typebot.io/blocks-base/schemas";
import { z } from "@typebot.io/zod";
import { InputBlockType } from "../constants";
import { textInputOptionsBaseSchema } from "../text/schema";

export const emailInputOptionsSchema = optionBaseSchema
  .merge(textInputOptionsBaseSchema)
  .merge(
    z.object({
      retryMessageContent: z.string().optional(),
    }),
  );

export const emailInputSchema = blockBaseSchema
  .merge(
    z.object({
      type: z.enum([InputBlockType.EMAIL]),
      options: emailInputOptionsSchema.optional(),
    }),
  )
  .openapi({
    title: "Email",
    ref: "email",
  });

export type EmailInputBlock = z.infer<typeof emailInputSchema>;
export type EmailInputOptions = z.infer<typeof emailInputOptionsSchema>;
