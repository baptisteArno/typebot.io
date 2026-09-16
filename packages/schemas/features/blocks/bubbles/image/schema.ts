import { z } from '../../../../zod'
import type { TElement } from '@udecode/plate-common'
import { BubbleBlockType } from '../constants'
import { blockBaseSchema } from '../../shared'

export const imageBubbleContentSchema = z.object({
  url: z.string().optional(),
  caption: z.array(z.any()).optional(),
  clickLink: z
    .object({
      url: z.string().optional(),
      alt: z.string().optional(),
    })
    .optional(),
})

export const imageBubbleBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([BubbleBlockType.IMAGE]),
    content: imageBubbleContentSchema.optional(),
  })
)

export type ImageBubbleBlock = Omit<
  z.infer<typeof imageBubbleBlockSchema>,
  'content'
> & {
  content?: {
    url?: string
    caption?: TElement[]
    clickLink?: { url?: string; alt?: string }
  }
}
