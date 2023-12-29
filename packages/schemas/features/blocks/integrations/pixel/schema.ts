import { z } from '../../../../zod'
import { pixelEventTypes } from './constants'
import { blockBaseSchema } from '../../shared'
import { IntegrationBlockType } from '../constants'

const basePixelOptionSchema = z.object({
  pixelId: z.string().optional(),
  isInitSkip: z.boolean().optional(),
  params: z
    .array(
      z.object({
        id: z.string(),
        key: z.string().optional(),
        value: z.any().optional(),
      })
    )
    .optional(),
})

const initialPixelOptionSchema = basePixelOptionSchema.merge(
  z.object({
    eventType: z.undefined().openapi({
      type: 'string',
    }),
  })
)

const standardPixelEventOptionSchema = basePixelOptionSchema.merge(
  z.object({
    eventType: z.enum(pixelEventTypes),
  })
)

const customPixelOptionSchema = basePixelOptionSchema.merge(
  z.object({
    eventType: z.enum(['Custom']),
    name: z.string().optional(),
  })
)

export const pixelOptionsSchema = z.discriminatedUnion('eventType', [
  initialPixelOptionSchema,
  standardPixelEventOptionSchema,
  customPixelOptionSchema,
])

export const pixelBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([IntegrationBlockType.PIXEL]),
    options: pixelOptionsSchema.optional(),
  })
)

export type PixelBlock = z.infer<typeof pixelBlockSchema>
