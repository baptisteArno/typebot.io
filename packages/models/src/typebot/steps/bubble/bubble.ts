import { z } from 'zod'
import { embedBubbleContentSchema, embedBubbleStepSchema } from './embed'
import { imageBubbleContentSchema, imageBubbleStepSchema } from './image'
import { textBubbleContentSchema, textBubbleStepSchema } from './text'
import { videoBubbleContentSchema, videoBubbleStepSchema } from './video'

export const bubbleStepContentSchema = textBubbleContentSchema
  .or(imageBubbleContentSchema)
  .or(videoBubbleContentSchema)
  .or(embedBubbleContentSchema)

export const bubbleStepSchema = textBubbleStepSchema
  .or(imageBubbleStepSchema)
  .or(videoBubbleStepSchema)
  .or(embedBubbleStepSchema)

export type BubbleStep = z.infer<typeof bubbleStepSchema>
export type BubbleStepContent = z.infer<typeof bubbleStepContentSchema>
