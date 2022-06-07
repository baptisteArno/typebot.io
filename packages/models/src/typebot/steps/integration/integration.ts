import { z } from 'zod'
import {
  googleAnalyticsOptionsSchema,
  googleAnalyticsStepSchema,
} from './googleAnalytics'
import {
  googleSheetsOptionsSchema,
  googleSheetsStepSchema,
} from './googleSheets'
import { makeComStepSchema } from './makeCom'
import { pabblyConnectStepSchema } from './pabblyConnect'
import { sendEmailOptionsSchema, sendEmailStepSchema } from './sendEmail'
import { webhookOptionsSchema, webhookStepSchema } from './webhook'
import { zapierStepSchema } from './zapier'

const integrationStepOptionsSchema = googleSheetsOptionsSchema
  .or(googleAnalyticsOptionsSchema)
  .or(webhookOptionsSchema)
  .or(sendEmailOptionsSchema)

export const integrationStepSchema = googleSheetsStepSchema
  .or(googleAnalyticsStepSchema)
  .or(webhookStepSchema)
  .or(sendEmailStepSchema)
  .or(zapierStepSchema)
  .or(makeComStepSchema)
  .or(pabblyConnectStepSchema)

export type IntegrationStep = z.infer<typeof integrationStepSchema>
export type IntegrationStepOptions = z.infer<
  typeof integrationStepOptionsSchema
>
