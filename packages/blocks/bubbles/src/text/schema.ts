import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import type { TElement } from "@typebot.io/rich-text/types";
import { z } from "@typebot.io/zod";
import { BubbleBlockType } from "../constants";

export const textBubbleContentSchema = z.object({
  html: z.string().optional(),
  richText: z.array(z.any()).optional(),
  plainText: z.string().optional(),
  localizations: z
    .record(
      z.string(),
      z.object({
        html: z.string().optional(),
        richText: z.array(z.any()).optional(),
        plainText: z.string().optional(),
      }),
    )
    .optional(),
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
  content?: {
    richText?: TElement[];
    html?: string;
    plainText?: string;
    localizations?: Record<
      string,
      {
        richText?: TElement[];
        html?: string;
        plainText?: string;
      }
    >;
  };
};
