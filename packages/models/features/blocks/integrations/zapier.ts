import { z } from 'zod'
import { blockBaseSchema } from '../baseSchemas'
import { IntegrationBlockType } from './enums'
import { webhookOptionsSchema } from './webhook'

export const zapierBlockSchema = blockBaseSchema.and(
  z.object({
    type: z.enum([IntegrationBlockType.ZAPIER]),
    options: webhookOptionsSchema,
    webhookId: z.string(),
  })
)

export type ZapierBlock = z.infer<typeof zapierBlockSchema>
