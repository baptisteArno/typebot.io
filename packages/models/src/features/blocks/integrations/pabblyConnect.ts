import { z } from 'zod'
import { blockBaseSchema, IntegrationBlockType } from '../shared'
import { webhookOptionsSchema } from './webhook'

export const pabblyConnectBlockSchema = blockBaseSchema.and(
  z.object({
    type: z.enum([IntegrationBlockType.PABBLY_CONNECT]),
    options: webhookOptionsSchema,
    webhookId: z.string(),
  })
)

export type PabblyConnectBlock = z.infer<typeof pabblyConnectBlockSchema>
