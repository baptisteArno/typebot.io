import { z } from 'zod'
import { blockBaseSchema } from '../baseSchemas'
import { IntegrationBlockType } from './enums'

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

export const webhookOptionsSchema = z.object({
  variablesForTest: z.array(variableForTestSchema),
  responseVariableMapping: z.array(responseVariableMappingSchema),
  isAdvancedConfig: z.boolean().optional(),
  isCustomBody: z.boolean().optional(),
})

export const webhookBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([IntegrationBlockType.WEBHOOK]),
    options: webhookOptionsSchema,
    webhookId: z.string(),
  })
)

export const defaultWebhookOptions: Omit<WebhookOptions, 'webhookId'> = {
  responseVariableMapping: [],
  variablesForTest: [],
  isAdvancedConfig: false,
  isCustomBody: false,
}

export type WebhookBlock = z.infer<typeof webhookBlockSchema>
export type WebhookOptions = z.infer<typeof webhookOptionsSchema>
export type ResponseVariableMapping = z.infer<
  typeof responseVariableMappingSchema
>
export type VariableForTest = z.infer<typeof variableForTestSchema>
