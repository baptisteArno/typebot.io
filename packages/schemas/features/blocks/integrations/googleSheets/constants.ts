export enum GoogleSheetsAction {
  GET = 'Get data from sheet',
  INSERT_ROW = 'Insert a row',
  UPDATE_ROW = 'Update a row',
}

export const totalRowsToExtractOptions = [
  'All',
  'First',
  'Last',
  'Random',
] as const

export const defaultGoogleSheetsOptions = {
  totalRowsToExtract: 'All',
} as const
