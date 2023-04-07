import { z } from 'zod'
import { blockBaseSchema } from '../baseSchemas'
import { BubbleBlockType } from './enums'

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
    content: imageBubbleContentSchema,
  })
)

export const defaultImageBubbleContent: ImageBubbleContent = {}

export type ImageBubbleBlock = z.infer<typeof imageBubbleBlockSchema>
export type ImageBubbleContent = z.infer<typeof imageBubbleContentSchema>
