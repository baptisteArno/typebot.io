import { z } from 'zod'
import { blockBaseSchema, IntegrationBlockType } from '../shared'
import { webhookOptionsSchema } from './webhook'

export const makeComBlockSchema = blockBaseSchema.and(
  z.object({
    type: z.enum([IntegrationBlockType.MAKE_COM]),
    options: webhookOptionsSchema,
    webhookId: z.string(),
  })
)

export type MakeComBlock = z.infer<typeof makeComBlockSchema>
