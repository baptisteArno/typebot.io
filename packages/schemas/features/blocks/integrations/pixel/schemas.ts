import { z } from 'zod'
import { pixelEventTypes } from './constants'
import { blockBaseSchema } from '../../baseSchemas'
import { IntegrationBlockType } from '../enums'

const basePixelOptionSchema = z.object({
  pixelId: z.string().optional(),
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
    eventType: z.undefined(),
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
    options: pixelOptionsSchema,
  })
)

export type PixelBlock = z.infer<typeof pixelBlockSchema>
