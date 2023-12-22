import { z } from '../../../../zod'
import type { TElement } from '@udecode/plate-common'
import { blockBaseSchema } from '../../shared'
import { BubbleBlockType } from '../constants'

export const textBubbleContentSchema = z.object({
  html: z.string().optional(),
  richText: z.array(z.any()).optional(),
  plainText: z.string().optional(),
})

export const textBubbleBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([BubbleBlockType.TEXT]),
    content: textBubbleContentSchema.optional(),
  })
)

export type TextBubbleBlock = Omit<
  z.infer<typeof textBubbleBlockSchema>,
  'content'
> & {
  content?: { richText?: TElement[]; html?: string; plainText?: string }
}
