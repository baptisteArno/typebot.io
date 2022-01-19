import { StepBase } from '.'
import { Table } from '../..'

export type IntegrationStep = GoogleSheetsStep | GoogleAnalyticsStep

export type IntegrationStepOptions =
  | GoogleSheetsOptions
  | GoogleAnalyticsOptions

export enum IntegrationStepType {
  GOOGLE_SHEETS = 'Google Sheets',
  GOOGLE_ANALYTICS = 'Google Analytics',
}

export type GoogleSheetsStep = StepBase & {
  type: IntegrationStepType.GOOGLE_SHEETS
  options?: GoogleSheetsOptions
}

export type GoogleAnalyticsStep = StepBase & {
  type: IntegrationStepType.GOOGLE_ANALYTICS
  options?: GoogleAnalyticsOptions
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
