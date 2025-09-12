import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import type { Element } from "@typebot.io/rich-text/plate";
import { z } from "@typebot.io/zod";
import { BubbleBlockType } from "../constants";

export const textBubbleContentSchema = z.object({
  html: z.string().optional(),
  richText: z.array(z.any()).optional(),
  plainText: z.string().optional(),
});

export const textBubbleBlockSchema = blockBaseSchema
  .merge(
    z.object({
      type: z.enum([BubbleBlockType.TEXT]),
      content: textBubbleContentSchema.optional(),
    }),
  )
  .openapi({
    title: "Text",
    ref: `textBlock`,
  });

export type TextBubbleBlock = Omit<
  z.infer<typeof textBubbleBlockSchema>,
  "content"
> & {
  content?: { richText?: Element[]; html?: string; plainText?: string };
};
