import {
  blockBaseSchema,
  optionBaseSchema,
} from "@typebot.io/blocks-base/schemas";
import { z } from "@typebot.io/zod";
import { InputBlockType } from "../constants";

export const timeInputOptionsSchema = optionBaseSchema.extend({
  labels: z
    .object({
      button: z.string().optional(),
    })
    .optional(),
});

export const timeInputSchema = blockBaseSchema
  .merge(
    z.object({
      type: z.enum([InputBlockType.TIME]),
      options: timeInputOptionsSchema.optional(),
    }),
  )
  .openapi({
    title: "Time",
    ref: "time",
  });

export type TimeInputBlock = z.infer<typeof timeInputSchema>;
export type TimeInputOptions = z.infer<typeof timeInputOptionsSchema>;
