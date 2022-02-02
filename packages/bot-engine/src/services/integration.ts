import {
  IntegrationStep,
  IntegrationStepType,
  GoogleSheetsStep,
  GoogleSheetsAction,
  GoogleSheetsInsertRowOptions,
  Variable,
  Table,
  GoogleSheetsUpdateRowOptions,
  Cell,
  GoogleSheetsGetOptions,
  GoogleAnalyticsStep,
  WebhookStep,
} from 'models'
import { stringify } from 'qs'
import { sendRequest } from 'utils'
import { sendGaEvent } from '../../lib/gtag'
import { parseVariables, parseVariablesInObject } from './variable'

const safeEval = eval

export const executeIntegration = (
  typebotId: string,
  step: IntegrationStep,
  variables: Table<Variable>,
  updateVariableValue: (variableId: string, value: string) => void
) => {
  switch (step.type) {
    case IntegrationStepType.GOOGLE_SHEETS:
      return executeGoogleSheetIntegration(step, variables, updateVariableValue)
    case IntegrationStepType.GOOGLE_ANALYTICS:
      return executeGoogleAnalyticsIntegration(step, variables)
    case IntegrationStepType.WEBHOOK:
      return executeWebhook(typebotId, step, variables, updateVariableValue)
  }
}

export const executeGoogleAnalyticsIntegration = async (
  step: GoogleAnalyticsStep,
  variables: Table<Variable>
) => {
  if (!step.options?.trackingId) return
  const { default: initGoogleAnalytics } = await import('../../lib/gtag')
  await initGoogleAnalytics(step.options.trackingId)
  sendGaEvent(parseVariablesInObject(step.options, variables))
}

const executeGoogleSheetIntegration = async (
  step: GoogleSheetsStep,
  variables: Table<Variable>,
  updateVariableValue: (variableId: string, value: string) => void
) => {
  if (!('action' in step.options)) return step.edgeId
  switch (step.options.action) {
    case GoogleSheetsAction.INSERT_ROW:
      await insertRowInGoogleSheets(step.options, variables)
      break
    case GoogleSheetsAction.UPDATE_ROW:
      await updateRowInGoogleSheets(step.options, variables)
      break
    case GoogleSheetsAction.GET:
      await getRowFromGoogleSheets(step.options, variables, updateVariableValue)
      break
  }
  return step.edgeId
}

const insertRowInGoogleSheets = async (
  options: GoogleSheetsInsertRowOptions,
  variables: Table<Variable>
) => {
  if (!options.cellsToInsert) return
  return sendRequest({
    url: `http://localhost:3001/api/integrations/google-sheets/spreadsheets/${options.spreadsheetId}/sheets/${options.sheetId}`,
    method: 'POST',
    body: {
      credentialsId: options.credentialsId,
      values: parseCellValues(options.cellsToInsert, variables),
    },
  })
}

const updateRowInGoogleSheets = async (
  options: GoogleSheetsUpdateRowOptions,
  variables: Table<Variable>
) => {
  if (!options.cellsToUpsert || !options.referenceCell) return
  return sendRequest({
    url: `http://localhost:3001/api/integrations/google-sheets/spreadsheets/${options.spreadsheetId}/sheets/${options.sheetId}`,
    method: 'PATCH',
    body: {
      credentialsId: options.credentialsId,
      values: parseCellValues(options.cellsToUpsert, variables),
      referenceCell: {
        column: options.referenceCell.column,
        value: parseVariables({
          text: options.referenceCell.value ?? '',
          variables,
        }),
      },
    },
  })
}

const getRowFromGoogleSheets = async (
  options: GoogleSheetsGetOptions,
  variables: Table<Variable>,
  updateVariableValue: (variableId: string, value: string) => void
) => {
  if (!options.referenceCell || !options.cellsToExtract) return
  const queryParams = stringify(
    {
      credentialsId: options.credentialsId,
      referenceCell: {
        column: options.referenceCell.column,
        value: parseVariables({
          text: options.referenceCell.value ?? '',
          variables,
        }),
      },
      columns: options.cellsToExtract.allIds.map(
        (id) => options.cellsToExtract?.byId[id].column
      ),
    },
    { indices: false }
  )
  const { data } = await sendRequest<{ [key: string]: string }>({
    url: `http://localhost:3001/api/integrations/google-sheets/spreadsheets/${options.spreadsheetId}/sheets/${options.sheetId}?${queryParams}`,
    method: 'GET',
  })
  if (!data) return
  options.cellsToExtract.allIds.forEach((cellId) => {
    const cell = options.cellsToExtract?.byId[cellId]
    if (!cell) return
    updateVariableValue(cell.variableId ?? '', data[cell.column ?? ''])
  })
}
const parseCellValues = (
  cells: Table<Cell>,
  variables: Table<Variable>
): { [key: string]: string } =>
  cells.allIds.reduce((row, id) => {
    const cell = cells.byId[id]
    return !cell.column || !cell.value
      ? row
      : {
          ...row,
          [cell.column]: parseVariables({ text: cell.value, variables }),
        }
  }, {})

const executeWebhook = async (
  typebotId: string,
  step: WebhookStep,
  variables: Table<Variable>,
  updateVariableValue: (variableId: string, value: string) => void
) => {
  if (!step.options?.webhookId) return step.edgeId
  const { data, error } = await sendRequest({
    url: `http://localhost:3000/api/typebots/${typebotId}/webhooks/${step.options?.webhookId}/execute`,
    method: 'POST',
    body: {
      variables,
    },
  })
  console.error(error)
  step.options.responseVariableMapping?.allIds.forEach((varMappingId) => {
    const varMapping = step.options?.responseVariableMapping?.byId[varMappingId]
    if (!varMapping?.bodyPath || !varMapping.variableId) return
    const value = safeEval(`(${JSON.stringify(data)}).${varMapping?.bodyPath}`)
    updateVariableValue(varMapping.variableId, value)
  })
}
