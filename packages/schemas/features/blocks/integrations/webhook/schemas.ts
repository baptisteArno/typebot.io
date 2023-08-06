import { z } from 'zod'
import { blockBaseSchema } from '../../baseSchemas'
import { IntegrationBlockType } from '../enums'
import { HttpMethod } from './enums'

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

export const webhookSchema = z.object({
  id: z.string(),
  queryParams: keyValueSchema.array(),
  headers: keyValueSchema.array(),
  method: z.nativeEnum(HttpMethod),
  url: z.string().optional(),
  body: z.string().optional(),
})

export const webhookOptionsSchema = z.object({
  variablesForTest: z.array(variableForTestSchema),
  responseVariableMapping: z.array(responseVariableMappingSchema),
  isAdvancedConfig: z.boolean().optional(),
  isCustomBody: z.boolean().optional(),
  isExecutedOnClient: z.boolean().optional(),
  webhook: webhookSchema.optional(),
})

export const webhookBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([IntegrationBlockType.WEBHOOK]),
    options: webhookOptionsSchema,
    webhookId: z
      .string()
      .describe('Deprecated, now integrated in webhook block options')
      .optional(),
  })
)

export const defaultWebhookAttributes: Omit<
  Webhook,
  'id' | 'body' | 'url' | 'typebotId' | 'createdAt' | 'updatedAt'
> = {
  method: HttpMethod.POST,
  headers: [],
  queryParams: [],
}

export const defaultWebhookOptions = (webhookId: string): WebhookOptions => ({
  responseVariableMapping: [],
  variablesForTest: [],
  isAdvancedConfig: false,
  isCustomBody: false,
  webhook: {
    id: webhookId,
    ...defaultWebhookAttributes,
  },
})

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
export type WebhookOptions = z.infer<typeof webhookOptionsSchema>
export type ResponseVariableMapping = z.infer<
  typeof responseVariableMappingSchema
>
export type VariableForTest = z.infer<typeof variableForTestSchema>
