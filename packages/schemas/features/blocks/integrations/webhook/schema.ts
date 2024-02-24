import { z } from '../../../../zod'
import { blockBaseSchema } from '../../shared'
import { IntegrationBlockType } from '../constants'
import { HttpMethod, maxTimeout } from './constants'

const variableForTestSchema = z.object({
  id: z.string(),
  variableId: z.string().optional(),
  value: z.string().optional(),
})

const responseVariableMappingSchema = z.object({
  id: z.string(),
  variableId: z.string().optional(),
  bodyPath: z.string().optional(),
})

const keyValueSchema = z.object({
  id: z.string(),
  key: z.string().optional(),
  value: z.string().optional(),
})

export const webhookV5Schema = z.object({
  id: z.string(),
  queryParams: keyValueSchema.array().optional(),
  headers: keyValueSchema.array().optional(),
  method: z.nativeEnum(HttpMethod).optional(),
  url: z.string().optional(),
  body: z.string().optional(),
})

const webhookSchemas = {
  v5: webhookV5Schema,
  v6: webhookV5Schema.omit({
    id: true,
  }),
}

const webhookSchema = z.union([webhookSchemas.v5, webhookSchemas.v6])

export const webhookOptionsV5Schema = z.object({
  variablesForTest: z.array(variableForTestSchema).optional(),
  responseVariableMapping: z.array(responseVariableMappingSchema).optional(),
  isAdvancedConfig: z.boolean().optional(),
  isCustomBody: z.boolean().optional(),
  isExecutedOnClient: z.boolean().optional(),
  webhook: webhookSchemas.v5.optional(),
  timeout: z.number().min(1).max(maxTimeout).optional(),
})

const webhookOptionsSchemas = {
  v5: webhookOptionsV5Schema,
  v6: webhookOptionsV5Schema.merge(
    z.object({
      webhook: webhookSchemas.v6.optional(),
    })
  ),
}

const webhookBlockV5Schema = blockBaseSchema.merge(
  z.object({
    type: z.enum([IntegrationBlockType.WEBHOOK]),
    options: webhookOptionsSchemas.v5.optional(),
    webhookId: z.string().optional(),
  })
)

export const webhookBlockSchemas = {
  v5: webhookBlockV5Schema,
  v6: webhookBlockV5Schema
    .omit({
      webhookId: true,
    })
    .merge(
      z.object({
        options: webhookOptionsSchemas.v6.optional(),
      })
    ),
}

const webhookBlockSchema = z.union([
  webhookBlockSchemas.v5,
  webhookBlockSchemas.v6,
])

export const executableWebhookSchema = z.object({
  url: z.string(),
  headers: z.record(z.string()).optional(),
  body: z.unknown().optional(),
  method: z.nativeEnum(HttpMethod).optional(),
})

export type KeyValue = { id: string; key?: string; value?: string }

export type WebhookResponse = {
  statusCode: number
  data?: unknown
}

export type ExecutableWebhook = z.infer<typeof executableWebhookSchema>

export type Webhook = z.infer<typeof webhookSchema>
export type WebhookBlock = z.infer<typeof webhookBlockSchema>
export type WebhookBlockV6 = z.infer<typeof webhookBlockSchemas.v6>
export type ResponseVariableMapping = z.infer<
  typeof responseVariableMappingSchema
>
export type VariableForTest = z.infer<typeof variableForTestSchema>
