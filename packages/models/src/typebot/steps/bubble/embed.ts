import { stepBaseSchema, BubbleStepType } from '../shared'
import { z } from 'zod'

export const embedBubbleContentSchema = z.object({
  url: z.string().optional(),
  height: z.number(),
})

export const embedBubbleStepSchema = stepBaseSchema.and(
  z.object({
    type: z.enum([BubbleStepType.EMBED]),
    content: embedBubbleContentSchema,
  })
)

export const defaultEmbedBubbleContent: EmbedBubbleContent = { height: 400 }

export type EmbedBubbleStep = z.infer<typeof embedBubbleStepSchema>
export type EmbedBubbleContent = z.infer<typeof embedBubbleContentSchema>
