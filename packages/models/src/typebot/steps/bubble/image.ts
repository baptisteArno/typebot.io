import { z } from 'zod'
import { stepBaseSchema, BubbleStepType } from '../shared'

export const imageBubbleContentSchema = z.object({
  url: z.string().optional(),
})

export const imageBubbleStepSchema = stepBaseSchema.and(
  z.object({
    type: z.enum([BubbleStepType.IMAGE]),
    content: imageBubbleContentSchema,
  })
)

export const defaultImageBubbleContent: ImageBubbleContent = {}

export type ImageBubbleStep = z.infer<typeof imageBubbleStepSchema>
export type ImageBubbleContent = z.infer<typeof imageBubbleContentSchema>
