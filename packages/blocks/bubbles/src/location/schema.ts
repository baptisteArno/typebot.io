import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import { z } from "@typebot.io/zod";
import { BubbleBlockType } from "../constants";

export const locationBubbleContentSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  name: z.string().optional(),
  address: z.string().optional(),
});

export const locationBubbleBlockSchema = blockBaseSchema
  .merge(
    z.object({
      type: z.enum([BubbleBlockType.LOCATION]),
      content: locationBubbleContentSchema.optional(),
    }),
  )
  .openapi({
    title: "Location",
    ref: `locationBlock`,
  });

export type LocationBubbleBlock = z.infer<typeof locationBubbleBlockSchema>;
export type LocationBubbleContent = z.infer<typeof locationBubbleContentSchema>;