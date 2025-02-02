import {
  blockBaseSchema,
  optionBaseSchema,
} from "@typebot.io/blocks-base/schemas";
import { z } from "@typebot.io/zod";
import { httpRequestOptionsSchemas } from "../../../integrations/src/httpRequest/schema";
import { InputBlockType } from "../constants";

export const otpInputOptionsSchema = optionBaseSchema
  .extend({
    labels: z
      .object({
        button: z.string().optional(),
      })
      .optional(),
    codeLength: z.number().optional(),
  })
  .merge(httpRequestOptionsSchemas.v6);

export const otpInputSchema = blockBaseSchema
  .merge(
    z.object({
      type: z.enum([InputBlockType.OTP]),
      options: otpInputOptionsSchema.optional(),
    }),
  )
  .openapi({
    title: "OTP",
    ref: "otpInput",
  });

export type OtpInputBlock = z.infer<typeof otpInputSchema>;
