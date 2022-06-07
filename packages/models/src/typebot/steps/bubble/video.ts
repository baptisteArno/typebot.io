import { stepBaseSchema, BubbleStepType } from '../shared'
import { z } from 'zod'

export enum VideoBubbleContentType {
  URL = 'url',
  YOUTUBE = 'youtube',
  VIMEO = 'vimeo',
}

export const videoBubbleContentSchema = z.object({
  url: z.string().optional(),
  id: z.string().optional(),
  type: z.nativeEnum(VideoBubbleContentType).optional(),
})

export const videoBubbleStepSchema = stepBaseSchema.and(
  z.object({
    type: z.enum([BubbleStepType.VIDEO]),
    content: videoBubbleContentSchema,
  })
)

export const defaultVideoBubbleContent: VideoBubbleContent = {}

export type VideoBubbleStep = z.infer<typeof videoBubbleStepSchema>
export type VideoBubbleContent = z.infer<typeof videoBubbleContentSchema>
