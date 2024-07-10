import { z } from '../../../../zod'
import { blockBaseSchema } from '../../shared'
import { VideoBubbleContentType } from './constants'
import { variableStringSchema } from '../../../utils'
import { BubbleBlockType } from '../constants'

export const videoBubbleContentSchema = z.object({
  url: z.string().optional(),
  id: z.string().optional(),
  type: z.nativeEnum(VideoBubbleContentType).optional(),
  height: z.number().or(variableStringSchema).optional(),
  aspectRatio: z.string().optional(),
  maxWidth: z.string().optional(),
  queryParamsStr: z.string().optional(),
  areControlsDisplayed: z.boolean().optional(),
  isAutoplayEnabled: z.boolean().optional(),
})

export const videoBubbleBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([BubbleBlockType.VIDEO]),
    content: videoBubbleContentSchema.optional(),
  })
)

export type VideoBubbleBlock = z.infer<typeof videoBubbleBlockSchema>
export type EmbeddableVideoBubbleContentType = Exclude<
  VideoBubbleContentType,
  VideoBubbleContentType.URL
>
