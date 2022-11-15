import { blockBaseSchema, BubbleBlockType } from '../shared'
import { z } from 'zod'

export const defaultTextBubbleContent: TextBubbleContent = {
  html: '',
  richText: [],
  plainText: '',
}

export const textBubbleContentSchema = z.object({
  html: z.string(),
  richText: z.array(z.any()),
  plainText: z.string(),
})

export type TextBubbleContent = z.infer<typeof textBubbleContentSchema>

export const textBubbleBlockSchema = blockBaseSchema.and(
  z.object({
    type: z.enum([BubbleBlockType.TEXT]),
    content: textBubbleContentSchema,
  })
)

export type TextBubbleBlock = z.infer<typeof textBubbleBlockSchema>
