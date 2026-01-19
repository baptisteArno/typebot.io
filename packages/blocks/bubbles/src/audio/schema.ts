import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import { z } from "zod";
import { BubbleBlockType } from "../constants";

export const audioBubbleContentSchema = z.object({
  url: z.string().optional(),
  isAutoplayEnabled: z.boolean().optional(),
});

export const audioBubbleBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([BubbleBlockType.AUDIO]),
    content: audioBubbleContentSchema.optional(),
  }),
);

export type AudioBubbleBlock = z.infer<typeof audioBubbleBlockSchema>;
export type AudioBubbleContent = z.infer<typeof audioBubbleContentSchema>;
