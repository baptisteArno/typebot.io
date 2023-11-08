import { z } from 'zod'
import { IntegrationBlockType } from '../constants'
import { webhookBlockSchemas } from '../webhook'

export const makeComBlockSchemas = {
  v5: webhookBlockSchemas.v5.merge(
    z.object({
      type: z.enum([IntegrationBlockType.MAKE_COM]),
    })
  ),
  v6: webhookBlockSchemas.v6.merge(
    z.object({
      type: z.enum([IntegrationBlockType.MAKE_COM]),
    })
  ),
} as const

const makeComBlockSchema = z.union([
  makeComBlockSchemas.v5,
  makeComBlockSchemas.v6,
])

export type MakeComBlock = z.infer<typeof makeComBlockSchema>
