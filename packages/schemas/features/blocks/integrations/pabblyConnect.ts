import { z } from 'zod'
import { blockBaseSchema } from '../baseSchemas'
import { IntegrationBlockType } from './enums'
import { webhookOptionsSchema } from './webhook'

export const pabblyConnectBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([IntegrationBlockType.PABBLY_CONNECT]),
    options: webhookOptionsSchema,
    webhookId: z.string(),
  })
)

export type PabblyConnectBlock = z.infer<typeof pabblyConnectBlockSchema>
