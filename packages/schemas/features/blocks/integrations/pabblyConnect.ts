import { z } from 'zod'
import { blockBaseSchema } from '../baseSchemas'
import { IntegrationBlockType } from './enums'
import { webhookOptionsSchema } from './webhook/schemas'

export const pabblyConnectBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([IntegrationBlockType.PABBLY_CONNECT]),
    options: webhookOptionsSchema,
    webhookId: z
      .string()
      .describe('Deprecated, use webhook.id instead')
      .optional(),
  })
)

export type PabblyConnectBlock = z.infer<typeof pabblyConnectBlockSchema>
