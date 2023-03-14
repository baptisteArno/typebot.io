import { z } from 'zod'
import { blockBaseSchema } from '../../baseSchemas'
import { BubbleBlockType } from '../enums'
import { VideoBubbleContentType } from './enums'

export const videoBubbleContentSchema = z.object({
  url: z.string().optional(),
  id: z.string().optional(),
  type: z.nativeEnum(VideoBubbleContentType).optional(),
})

export const videoBubbleBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([BubbleBlockType.VIDEO]),
    content: videoBubbleContentSchema,
  })
)

export const defaultVideoBubbleContent: VideoBubbleContent = {}

export type VideoBubbleBlock = z.infer<typeof videoBubbleBlockSchema>
export type VideoBubbleContent = z.infer<typeof videoBubbleContentSchema>
