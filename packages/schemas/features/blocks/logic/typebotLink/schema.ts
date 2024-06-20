import { z } from '../../../../zod'
import { blockBaseSchema } from '../../shared'
import { LogicBlockType } from '../constants'

export const sniperLinkOptionsSchema = z.object({
  sniperId: z.string().optional(),
  groupId: z.string().optional(),
  mergeResults: z.boolean().optional(),
})

export const sniperLinkBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.SNIPER_LINK]),
    options: sniperLinkOptionsSchema.optional(),
  })
)

export type SniperLinkBlock = z.infer<typeof sniperLinkBlockSchema>
