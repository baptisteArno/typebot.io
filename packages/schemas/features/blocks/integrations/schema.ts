import { z } from '../../../zod'
import { chatwootBlockSchema } from './chatwoot'
import { googleAnalyticsBlockSchema } from './googleAnalytics'
import { googleSheetsBlockSchemas } from './googleSheets'
import { openAIBlockSchema } from './openai'
import { pixelBlockSchema } from './pixel/schema'
import { sendEmailBlockSchema } from './sendEmail'
import { zapierBlockSchemas } from './zapier'
import { httpBlockSchemas } from './webhook'
import { makeComBlockSchemas } from './makeCom'
import { pabblyConnectBlockSchemas } from './pabblyConnect'

export const integrationBlockSchemas = {
  v5: [
    chatwootBlockSchema,
    googleAnalyticsBlockSchema,
    googleSheetsBlockSchemas.v5,
    makeComBlockSchemas.v5,
    openAIBlockSchema,
    pabblyConnectBlockSchemas.v5,
    sendEmailBlockSchema,
    httpBlockSchemas.v5,
    zapierBlockSchemas.v5,
    pixelBlockSchema,
  ],
  v6: [
    chatwootBlockSchema,
    googleAnalyticsBlockSchema,
    googleSheetsBlockSchemas.v6,
    makeComBlockSchemas.v6,
    openAIBlockSchema,
    pabblyConnectBlockSchemas.v6,
    sendEmailBlockSchema,
    httpBlockSchemas.v6,
    zapierBlockSchemas.v6,
    pixelBlockSchema,
  ],
} as const

const integrationBlockV5Schema = z.discriminatedUnion('type', [
  ...integrationBlockSchemas.v5,
])

const integrationBlockV6Schema = z.discriminatedUnion('type', [
  ...integrationBlockSchemas.v6,
])

const integrationBlockSchema = z.union([
  integrationBlockV5Schema,
  integrationBlockV6Schema,
])

export type IntegrationBlock = z.infer<typeof integrationBlockSchema>
export type IntegrationBlockV5 = z.infer<typeof integrationBlockV5Schema>
export type IntegrationBlockV6 = z.infer<typeof integrationBlockV6Schema>
