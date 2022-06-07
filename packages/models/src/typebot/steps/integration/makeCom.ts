import { z } from 'zod'
import { IntegrationStepType, stepBaseSchema } from '../shared'
import { webhookOptionsSchema } from './webhook'

export const makeComStepSchema = stepBaseSchema.and(
  z.object({
    type: z.enum([IntegrationStepType.MAKE_COM]),
    options: webhookOptionsSchema,
    webhookId: z.string(),
  })
)

export type MakeComStep = z.infer<typeof makeComStepSchema>
