import { z } from 'zod'
import { chatwootBlockSchema } from './chatwoot'
import { googleAnalyticsBlockSchema } from './googleAnalytics'
import { googleSheetsBlockSchema } from './googleSheets/schemas'
import { makeComBlockSchema } from './makeCom'
import { openAIBlockSchema } from './openai'
import { pabblyConnectBlockSchema } from './pabblyConnect'
import { sendEmailBlockSchema } from './sendEmail'
import { webhookBlockSchema } from './webhook'
import { zapierBlockSchema } from './zapier'

export const integrationBlockSchema = googleSheetsBlockSchema
  .or(googleAnalyticsBlockSchema)
  .or(webhookBlockSchema)
  .or(sendEmailBlockSchema)
  .or(zapierBlockSchema)
  .or(makeComBlockSchema)
  .or(pabblyConnectBlockSchema)
  .or(chatwootBlockSchema)
  .or(openAIBlockSchema)

export type IntegrationBlock = z.infer<typeof integrationBlockSchema>
export type IntegrationBlockOptions = IntegrationBlock['options']
