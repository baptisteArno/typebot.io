import { z } from 'zod'
import { IntegrationStepType, stepBaseSchema } from '../shared'
import { webhookOptionsSchema } from './webhook'

export const pabblyConnectStepSchema = stepBaseSchema.and(
  z.object({
    type: z.enum([IntegrationStepType.PABBLY_CONNECT]),
    options: webhookOptionsSchema,
    webhookId: z.string(),
  })
)

export type PabblyConnectStep = z.infer<typeof pabblyConnectStepSchema>
