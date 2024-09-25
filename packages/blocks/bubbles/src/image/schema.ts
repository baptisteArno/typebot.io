import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import { z } from "@typebot.io/zod";
import { BubbleBlockType } from "../constants";

export const imageBubbleContentSchema = z.object({
  url: z.string().optional(),
  clickLink: z
    .object({
      url: z.string().optional(),
      alt: z.string().optional(),
    })
    .optional(),
});

export const imageBubbleBlockSchema = blockBaseSchema
  .merge(
    z.object({
      type: z.enum([BubbleBlockType.IMAGE]),
      content: imageBubbleContentSchema.optional(),
    }),
  )
  .openapi({
    title: "Image",
    ref: `imageBlock`,
  });

export type ImageBubbleBlock = z.infer<typeof imageBubbleBlockSchema>;
