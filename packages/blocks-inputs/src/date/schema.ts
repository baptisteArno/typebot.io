import { z } from "zod";
import { blockBaseSchema } from "@typebot.io/blocks-core/schemas/base";
import { InputBlockType } from "../constants";

export const dateInputOptionsSchema = z.object({
  format: z.string().optional(),
  isRange: z.boolean().optional(),
  rangeSeparator: z.string().optional(),
  hasTime: z.boolean().optional(),
  labels: z
    .object({
      button: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional(),
    })
    .optional(),
});

export const dateInputSchema = blockBaseSchema.merge(
  z.object({
    type: z.literal(InputBlockType.DATE),
    options: dateInputOptionsSchema.optional(),
  })
);

export type DateInputBlock = z.infer<typeof dateInputSchema>;
export type DateInputOptions = z.infer<typeof dateInputOptionsSchema>;
