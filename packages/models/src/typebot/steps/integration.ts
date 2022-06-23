import { StepBase } from '.'

export type IntegrationStep =
  | GoogleSheetsStep
  | GoogleAnalyticsStep
  | WebhookStep
  | SendEmailStep
  | ZapierStep
  | MakeComStep
  | PabblyConnectStep

export type IntegrationStepOptions =
  | GoogleSheetsOptions
  | GoogleAnalyticsOptions
  | WebhookOptions
  | SendEmailOptions

export enum IntegrationStepType {
  GOOGLE_SHEETS = 'Google Sheets',
  GOOGLE_ANALYTICS = 'Google Analytics',
  WEBHOOK = 'Webhook',
  EMAIL = 'Email',
  ZAPIER = 'Zapier',
  MAKE_COM = 'Make.com',
  PABBLY_CONNECT = 'Pabbly',
}

export type GoogleSheetsStep = StepBase & {
  type: IntegrationStepType.GOOGLE_SHEETS
  options: GoogleSheetsOptions
}

export type GoogleAnalyticsStep = StepBase & {
  type: IntegrationStepType.GOOGLE_ANALYTICS
  options: GoogleAnalyticsOptions
}

export type WebhookStep = StepBase & {
  type: IntegrationStepType.WEBHOOK
  options: WebhookOptions
  webhookId: string
}

export type ZapierStep = Omit<WebhookStep, 'type'> & {
  type: IntegrationStepType.ZAPIER
}

export type MakeComStep = Omit<WebhookStep, 'type'> & {
  type: IntegrationStepType.MAKE_COM
}

export type PabblyConnectStep = Omit<WebhookStep, 'type'> & {
  type: IntegrationStepType.PABBLY_CONNECT
}

export type SendEmailStep = StepBase & {
  type: IntegrationStepType.EMAIL
  options: SendEmailOptions
}

export type SendEmailOptions = {
  credentialsId: string | 'default'
  recipients: string[]
  replyTo?: string
  cc?: string[]
  bcc?: string[]
  subject?: string
  body?: string
}

export type GoogleAnalyticsOptions = {
  trackingId?: string
  category?: string
  action?: string
  label?: string
  value?: number
}

export enum GoogleSheetsAction {
  GET = 'Get data from sheet',
  INSERT_ROW = 'Insert a row',
  UPDATE_ROW = 'Update a row',
}

export type GoogleSheetsOptions =
  | GoogleSheetsOptionsBase
  | GoogleSheetsGetOptions
  | GoogleSheetsInsertRowOptions
  | GoogleSheetsUpdateRowOptions

export type GoogleSheetsOptionsBase = {
  credentialsId?: string
  spreadsheetId?: string
  sheetId?: string
}

export type Cell = { id: string; column?: string; value?: string }
export type ExtractingCell = {
  id: string
  column?: string
  variableId?: string
}

export type GoogleSheetsGetOptions = NonNullable<GoogleSheetsOptionsBase> & {
  action: GoogleSheetsAction.GET
  referenceCell?: Cell
  cellsToExtract: ExtractingCell[]
}

export type GoogleSheetsInsertRowOptions =
  NonNullable<GoogleSheetsOptionsBase> & {
    action: GoogleSheetsAction.INSERT_ROW
    cellsToInsert: Cell[]
  }

export type GoogleSheetsUpdateRowOptions =
  NonNullable<GoogleSheetsOptionsBase> & {
    action: GoogleSheetsAction.UPDATE_ROW
    referenceCell?: Cell
    cellsToUpsert: Cell[]
  }

export type ResponseVariableMapping = {
  id: string
  bodyPath?: string
  variableId?: string
}

export type WebhookOptions = {
  variablesForTest: VariableForTest[]
  responseVariableMapping: ResponseVariableMapping[]
  isAdvancedConfig?: boolean
  isCustomBody?: boolean
}

export type VariableForTest = {
  id: string
  variableId?: string
  value?: string
}

export const defaultGoogleSheetsOptions: GoogleSheetsOptions = {}

export const defaultGoogleAnalyticsOptions: GoogleAnalyticsOptions = {}

export const defaultWebhookOptions: Omit<WebhookOptions, 'webhookId'> = {
  responseVariableMapping: [],
  variablesForTest: [],
  isAdvancedConfig: false,
  isCustomBody: false,
}

export const defaultSendEmailOptions: SendEmailOptions = {
  credentialsId: 'default',
  recipients: [],
}
