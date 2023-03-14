import { z } from 'zod'
import { variableStringSchema } from '../../utils'
import { blockBaseSchema } from '../baseSchemas'
import { BubbleBlockType } from './enums'

export const embedBubbleContentSchema = z.object({
  url: z.string().optional(),
  height: z.number().or(variableStringSchema),
})

export const embedBubbleBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([BubbleBlockType.EMBED]),
    content: embedBubbleContentSchema,
  })
)

export const defaultEmbedBubbleContent: EmbedBubbleContent = { height: 400 }

export type EmbedBubbleBlock = z.infer<typeof embedBubbleBlockSchema>
export type EmbedBubbleContent = z.infer<typeof embedBubbleContentSchema>
