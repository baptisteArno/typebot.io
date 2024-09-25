import {
  blockBaseSchema,
  optionBaseSchema,
} from "@typebot.io/blocks-base/schemas";
import { variableStringSchema } from "@typebot.io/variables/schemas";
import { z } from "@typebot.io/zod";
import { InputBlockType } from "../constants";

export const ratingInputOptionsSchema = optionBaseSchema.merge(
  z.object({
    buttonType: z.literal("Icons").or(z.literal("Numbers")).optional(),
    length: z.number().optional(),
    startsAt: z.number().or(variableStringSchema).optional(),
    labels: z
      .object({
        left: z.string().optional(),
        right: z.string().optional(),
        button: z.string().optional(),
      })
      .optional(),
    customIcon: z
      .object({
        isEnabled: z.boolean().optional(),
        svg: z.string().optional(),
      })
      .optional(),
    isOneClickSubmitEnabled: z.boolean().optional(),
  }),
);

export const ratingInputBlockSchema = blockBaseSchema
  .merge(
    z.object({
      type: z.literal(InputBlockType.RATING),
      options: ratingInputOptionsSchema.optional(),
    }),
  )
  .openapi({
    title: "Rating",
    ref: "rating",
  });

export type RatingInputBlock = z.infer<typeof ratingInputBlockSchema>;
