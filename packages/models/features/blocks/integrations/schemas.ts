import { z } from 'zod'
import { chatwootBlockSchema, chatwootOptionsSchema } from './chatwoot'
import {
  googleAnalyticsOptionsSchema,
  googleAnalyticsBlockSchema,
} from './googleAnalytics'
import {
  googleSheetsOptionsSchema,
  googleSheetsBlockSchema,
} from './googleSheets/schemas'
import { makeComBlockSchema } from './makeCom'
import { pabblyConnectBlockSchema } from './pabblyConnect'
import { sendEmailOptionsSchema, sendEmailBlockSchema } from './sendEmail'
import { webhookOptionsSchema, webhookBlockSchema } from './webhook'
import { zapierBlockSchema } from './zapier'

const integrationBlockOptionsSchema = googleSheetsOptionsSchema
  .or(googleAnalyticsOptionsSchema)
  .or(webhookOptionsSchema)
  .or(sendEmailOptionsSchema)
  .or(chatwootOptionsSchema)

export const integrationBlockSchema = googleSheetsBlockSchema
  .or(googleAnalyticsBlockSchema)
  .or(webhookBlockSchema)
  .or(sendEmailBlockSchema)
  .or(zapierBlockSchema)
  .or(makeComBlockSchema)
  .or(pabblyConnectBlockSchema)
  .or(chatwootBlockSchema)

export type IntegrationBlock = z.infer<typeof integrationBlockSchema>
export type IntegrationBlockOptions = z.infer<
  typeof integrationBlockOptionsSchema
>
