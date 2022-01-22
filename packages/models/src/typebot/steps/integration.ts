import { StepBase } from '.'
import { Table } from '../..'

export type IntegrationStep =
  | GoogleSheetsStep
  | GoogleAnalyticsStep
  | WebhookStep

export type IntegrationStepOptions =
  | GoogleSheetsOptions
  | GoogleAnalyticsOptions
  | WebhookOptions

export enum IntegrationStepType {
  GOOGLE_SHEETS = 'Google Sheets',
  GOOGLE_ANALYTICS = 'Google Analytics',
  WEBHOOK = 'Webhook',
}

export type GoogleSheetsStep = StepBase & {
  type: IntegrationStepType.GOOGLE_SHEETS
  options?: GoogleSheetsOptions
}

export type GoogleAnalyticsStep = StepBase & {
  type: IntegrationStepType.GOOGLE_ANALYTICS
  options?: GoogleAnalyticsOptions
}

export type WebhookStep = StepBase & {
  type: IntegrationStepType.WEBHOOK
  options?: WebhookOptions
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
  | GoogleSheetsGetOptions
  | GoogleSheetsInsertRowOptions
  | GoogleSheetsUpdateRowOptions

type GoogleSheetsOptionsBase = {
  credentialsId?: string
  spreadsheetId?: string
  sheetId?: string
}

export type Cell = { column?: string; value?: string }
export type ExtractingCell = { column?: string; variableId?: string }

export type GoogleSheetsGetOptions = GoogleSheetsOptionsBase & {
  action?: GoogleSheetsAction.GET
  referenceCell?: Cell
  cellsToExtract?: Table<ExtractingCell>
}

export type GoogleSheetsInsertRowOptions = GoogleSheetsOptionsBase & {
  action?: GoogleSheetsAction.INSERT_ROW
  cellsToInsert?: Table<Cell>
}

export type GoogleSheetsUpdateRowOptions = GoogleSheetsOptionsBase & {
  action?: GoogleSheetsAction.UPDATE_ROW
  referenceCell?: Cell
  cellsToUpsert?: Table<Cell>
}

export type ResponseVariableMapping = { bodyPath?: string; variableId?: string }

export type WebhookOptions = {
  webhookId?: string
  variablesForTest?: Table<VariableForTest>
  responseVariableMapping?: Table<ResponseVariableMapping>
}

export enum HttpMethod {
  POST = 'POST',
  GET = 'GET',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  CONNECT = 'CONNECT',
  OPTIONS = 'OPTIONS',
  TRACE = 'TRACE',
}

export type KeyValue = { key?: string; value?: string }
export type VariableForTest = { variableId?: string; value?: string }

export type Webhook = {
  id: string
  url?: string
  method?: HttpMethod
  queryParams?: Table<KeyValue>
  headers?: Table<KeyValue>
  body?: string
}

export type WebhookResponse = {
  statusCode: number
  data?: unknown
}
