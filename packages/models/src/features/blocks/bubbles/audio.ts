import { z } from 'zod'
import { blockBaseSchema, BubbleBlockType } from '../shared'

export const audioBubbleContentSchema = z.object({
  url: z.string().optional(),
})

export const audioBubbleBlockSchema = blockBaseSchema.and(
  z.object({
    type: z.enum([BubbleBlockType.AUDIO]),
    content: audioBubbleContentSchema,
  })
)

export const defaultAudioBubbleContent = {}

export type AudioBubbleBlock = z.infer<typeof audioBubbleBlockSchema>
export type AudioBubbleContent = z.infer<typeof audioBubbleContentSchema>
