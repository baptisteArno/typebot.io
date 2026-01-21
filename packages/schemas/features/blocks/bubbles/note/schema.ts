import { z } from '../../../../zod'
import { blockBaseSchema } from '../../shared'
import { BubbleBlockType } from '../constants'
import type { TElement } from '@udecode/plate-common'

export const noteContentSchema = z.object({
  plainText: z.string().optional(),
  richText: z.array(z.any()).optional(),
})

export const noteBubbleBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([BubbleBlockType.NOTE]),
    content: noteContentSchema.optional(),
  })
)

export type NoteBubbleBlock = Omit<
  z.infer<typeof noteBubbleBlockSchema>,
  'content'
> & {
  content?: { richText?: TElement[]; plainText?: string }
}
