import { z } from 'zod'
import { IntegrationBlockType } from '../constants'
import { webhookBlockSchemas } from '../webhook'

export const pabblyConnectBlockSchemas = {
  v5: webhookBlockSchemas.v5.merge(
    z.object({
      type: z.enum([IntegrationBlockType.PABBLY_CONNECT]),
    })
  ),
  v6: webhookBlockSchemas.v6.merge(
    z.object({
      type: z.enum([IntegrationBlockType.PABBLY_CONNECT]),
    })
  ),
} as const

const pabblyConnectBlockSchema = z.union([
  pabblyConnectBlockSchemas.v5,
  pabblyConnectBlockSchemas.v6,
])

export type PabblyConnectBlock = z.infer<typeof pabblyConnectBlockSchema>
