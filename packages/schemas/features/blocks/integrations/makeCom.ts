import { z } from 'zod'
import { blockBaseSchema } from '../baseSchemas'
import { IntegrationBlockType } from './enums'
import { webhookOptionsSchema } from './webhook/schemas'

export const makeComBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([IntegrationBlockType.MAKE_COM]),
    options: webhookOptionsSchema,
    webhookId: z
      .string()
      .describe('Deprecated, use webhook.id instead')
      .optional(),
  })
)

export type MakeComBlock = z.infer<typeof makeComBlockSchema>
