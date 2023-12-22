import { z } from '../../../zod'
import { audioBubbleBlockSchema } from './audio'
import { embedBubbleBlockSchema } from './embed'
import { imageBubbleBlockSchema } from './image'
import { textBubbleBlockSchema } from './text'
import { videoBubbleBlockSchema } from './video'

export const bubbleBlockSchemas = [
  textBubbleBlockSchema,
  imageBubbleBlockSchema,
  videoBubbleBlockSchema,
  embedBubbleBlockSchema,
  audioBubbleBlockSchema,
] as const

export const bubbleBlockSchema = z.discriminatedUnion('type', [
  ...bubbleBlockSchemas,
])

export type BubbleBlock = z.infer<typeof bubbleBlockSchema>
export type BubbleBlockContent = BubbleBlock['content']
