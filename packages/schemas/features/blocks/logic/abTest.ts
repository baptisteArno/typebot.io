import { z } from 'zod'
import { blockBaseSchema } from '../baseSchemas'
import { LogicBlockType } from './enums'
import { itemBaseSchema } from '../../items/baseSchemas'
import { ItemType } from '../../items/enums'

export const aItemSchema = itemBaseSchema.extend({
  type: z.literal(ItemType.AB_TEST),
  path: z.literal('a'),
})

export const bItemSchema = itemBaseSchema.extend({
  type: z.literal(ItemType.AB_TEST),
  path: z.literal('b'),
})

export const abTestBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.AB_TEST]),
    items: z.tuple([aItemSchema, bItemSchema]),
    options: z.object({
      aPercent: z.number().min(0).max(100),
    }),
  })
)

export const defaultAbTestOptions = {
  aPercent: 50,
}

export type AbTestBlock = z.infer<typeof abTestBlockSchema>
