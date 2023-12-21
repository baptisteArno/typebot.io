import { z } from '../../../zod'
import { blockBaseSchema } from '../shared'

export const startBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.literal('start'),
    label: z.string(),
  })
)

export type StartBlock = z.infer<typeof startBlockSchema>
