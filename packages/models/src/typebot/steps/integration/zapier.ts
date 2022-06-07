import { z } from 'zod'
import { IntegrationStepType, stepBaseSchema } from '../shared'
import { webhookOptionsSchema } from './webhook'

export const zapierStepSchema = stepBaseSchema.and(
  z.object({
    type: z.enum([IntegrationStepType.ZAPIER]),
    options: webhookOptionsSchema,
    webhookId: z.string(),
  })
)

export type ZapierStep = z.infer<typeof zapierStepSchema>
