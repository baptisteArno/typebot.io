import { z } from '../../../../zod'
import { blockBaseSchema } from '../../shared'
import { LogicBlockType } from '../constants'
import { itemBaseSchemas } from '../../../items/shared'

export const aItemSchemas = {
  v5: itemBaseSchemas.v5.extend({
    path: z.literal('a'),
  }),
  v6: itemBaseSchemas.v6.extend({
    path: z.literal('a'),
  }),
}

export const bItemSchemas = {
  v5: itemBaseSchemas.v5.extend({
    path: z.literal('b'),
  }),
  v6: itemBaseSchemas.v6.extend({
    path: z.literal('b'),
  }),
}

const abTestBlockV5Schema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.AB_TEST]),
    items: z.tuple([aItemSchemas.v5, bItemSchemas.v5]),
    options: z
      .object({
        aPercent: z.number().min(0).max(100).optional(),
      })
      .optional(),
  })
)

export const abTestBlockSchemas = {
  v5: abTestBlockV5Schema,
  v6: abTestBlockV5Schema.extend({
    items: z.tuple([aItemSchemas.v6, bItemSchemas.v6]),
  }),
} as const

export const abTestBlockSchema = z.union([
  abTestBlockSchemas.v5,
  abTestBlockSchemas.v6,
])

export type AbTestBlock = z.infer<typeof abTestBlockSchema>
