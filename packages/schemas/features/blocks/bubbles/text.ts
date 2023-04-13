import { z } from 'zod'
import { blockBaseSchema } from '../baseSchemas'
import { BubbleBlockType } from './enums'
import type { TElement } from '@udecode/plate-common'

export const defaultTextBubbleContent: TextBubbleContent = {
  richText: [],
}

export const textBubbleContentSchema = z.object({
  html: z.string().optional(),
  richText: z.array(z.any()),
  plainText: z.string().optional(),
})

export const textBubbleBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([BubbleBlockType.TEXT]),
    content: textBubbleContentSchema,
  })
)

export type TextBubbleBlock = Omit<
  z.infer<typeof textBubbleBlockSchema>,
  'content'
> & {
  content: { richText: TElement[]; html?: string; plainText?: string }
}
export type TextBubbleContent = TextBubbleBlock['content']
