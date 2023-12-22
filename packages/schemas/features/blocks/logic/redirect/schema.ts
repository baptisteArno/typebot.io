import { z } from '../../../../zod'
import { blockBaseSchema } from '../../shared'
import { LogicBlockType } from '../constants'

export const redirectOptionsSchema = z.object({
  url: z.string().optional(),
  isNewTab: z.boolean().optional(),
})

export const redirectBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.REDIRECT]),
    options: redirectOptionsSchema.optional(),
  })
)

export type RedirectBlock = z.infer<typeof redirectBlockSchema>
