import { z } from '../../../../zod'
import { BubbleBlockType } from '../constants'
import { blockBaseSchema } from '../../shared'

export const imageBubbleContentSchema = z.object({
  url: z.string().optional(),
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

export type ImageBubbleBlock = z.infer<typeof imageBubbleBlockSchema>
