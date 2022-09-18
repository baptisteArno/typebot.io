import { blockBaseSchema, BubbleBlockType } from '../shared'
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

export const videoBubbleBlockSchema = blockBaseSchema.and(
  z.object({
    type: z.enum([BubbleBlockType.VIDEO]),
    content: videoBubbleContentSchema,
  })
)

export const defaultVideoBubbleContent: VideoBubbleContent = {}

export type VideoBubbleBlock = z.infer<typeof videoBubbleBlockSchema>
export type VideoBubbleContent = z.infer<typeof videoBubbleContentSchema>
