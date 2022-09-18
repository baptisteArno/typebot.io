import { z } from 'zod'
import { blockBaseSchema, BubbleBlockType } from '../shared'

export const imageBubbleContentSchema = z.object({
  url: z.string().optional(),
})

export const imageBubbleBlockSchema = blockBaseSchema.and(
  z.object({
    type: z.enum([BubbleBlockType.IMAGE]),
    content: imageBubbleContentSchema,
  })
)

export const defaultImageBubbleContent: ImageBubbleContent = {}

export type ImageBubbleBlock = z.infer<typeof imageBubbleBlockSchema>
export type ImageBubbleContent = z.infer<typeof imageBubbleContentSchema>
