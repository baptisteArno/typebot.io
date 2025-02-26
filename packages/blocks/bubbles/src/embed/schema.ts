import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import { singleVariableOrNumberSchema } from "@typebot.io/variables/schemas";
import { z } from "@typebot.io/zod";
import { BubbleBlockType } from "../constants";

export const embedBubbleContentSchema = z.object({
  url: z.string().optional(),
  height: singleVariableOrNumberSchema.optional(),
  waitForEvent: z
    .object({
      isEnabled: z.boolean().optional(),
      name: z.string().optional(),
      saveDataInVariableId: z.string().optional(),
    })
    .optional(),
});

export const embedBubbleBlockSchema = blockBaseSchema
  .merge(
    z.object({
      type: z.enum([BubbleBlockType.EMBED]),
      content: embedBubbleContentSchema.optional(),
    }),
  )
  .openapi({
    title: "Embed",
    ref: `embedBlock`,
  });

export type EmbedBubbleBlock = z.infer<typeof embedBubbleBlockSchema>;
