import { z } from '../../../../zod'
import { IntegrationBlockType } from '../constants'
import { httpBlockSchemas } from '../webhook'

export const zapierBlockSchemas = {
  v5: httpBlockSchemas.v5.merge(
    z.object({
      type: z.enum([IntegrationBlockType.ZAPIER]),
    })
  ),
  v6: httpBlockSchemas.v6.merge(
    z.object({
      type: z.enum([IntegrationBlockType.ZAPIER]),
    })
  ),
} as const

const zapierBlockSchema = z.union([
  zapierBlockSchemas.v5,
  zapierBlockSchemas.v6,
])

export type ZapierBlock = z.infer<typeof zapierBlockSchema>
export type ZapierBlockV5 = z.infer<typeof zapierBlockSchemas.v5>
export type ZapierBlockV6 = z.infer<typeof zapierBlockSchemas.v6>
