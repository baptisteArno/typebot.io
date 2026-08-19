import {
  blockBaseSchema,
  optionBaseSchema,
} from "@typebot.io/blocks-base/schemas";
import { z } from "zod";
import { InputBlockType } from "../constants";

export const dateInputOptionsSchema = optionBaseSchema.merge(
  z.object({
    labels: z
      .object({
        button: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        separator: z
          .string()
          .optional()
          .describe(
            "Word joining the start and end date in the submitted range value, e.g. the 'to' in '01/01/2024 to 05/01/2024'",
          ),
      })
      .optional(),
    hasTime: z.boolean().optional(),
    isRange: z.boolean().optional(),
    format: z
      .string()
      .optional()
      .describe(
        "Format of the string is based on Unicode Technical Standard #35",
      ),
    min: z.string().optional(),
    max: z.string().optional(),
  }),
);

export const dateInputSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([InputBlockType.DATE]),
    options: dateInputOptionsSchema.optional(),
  }),
);

export type DateInputBlock = z.infer<typeof dateInputSchema>;
