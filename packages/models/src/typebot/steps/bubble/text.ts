import { stepBaseSchema, BubbleStepType } from '../shared'
import { z } from 'zod'

export const defaultTextBubbleContent: TextBubbleContent = {
  html: '',
  richText: [],
  plainText: '',
}

export const textBubbleContentSchema = z.object({
  html: z.string(),
  richText: z.array(z.any()),
  plainText: z.string(),
})

export type TextBubbleContent = z.infer<typeof textBubbleContentSchema>

export const textBubbleStepSchema = stepBaseSchema.and(
  z.object({
    type: z.enum([BubbleStepType.TEXT]),
    content: textBubbleContentSchema,
  })
)

export type TextBubbleStep = z.infer<typeof textBubbleStepSchema>
