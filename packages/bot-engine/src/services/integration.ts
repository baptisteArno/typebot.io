import {
  IntegrationStep,
  IntegrationStepType,
  GoogleSheetsStep,
  GoogleSheetsAction,
  GoogleSheetsInsertRowOptions,
  Variable,
  GoogleSheetsUpdateRowOptions,
  Cell,
  GoogleSheetsGetOptions,
  GoogleAnalyticsStep,
  WebhookStep,
  SendEmailStep,
} from 'models'
import { stringify } from 'qs'
import { sendRequest } from 'utils'
import { sendGaEvent } from '../../lib/gtag'
import { parseVariables, parseVariablesInObject } from './variable'

const safeEval = eval

type Indices = { blockIndex: number; stepIndex: number }
export const executeIntegration = (
  typebotId: string,
  step: IntegrationStep,
  variables: Variable[],
  indices: Indices,
  updateVariableValue: (variableId: string, value: string) => void
): Promise<string | undefined> => {
  switch (step.type) {
    case IntegrationStepType.GOOGLE_SHEETS:
      return executeGoogleSheetIntegration(step, variables, updateVariableValue)
    case IntegrationStepType.GOOGLE_ANALYTICS:
      return executeGoogleAnalyticsIntegration(step, variables)
    case IntegrationStepType.WEBHOOK:
      return executeWebhook(
        typebotId,
        step,
        variables,
        indices,
        updateVariableValue
      )
    case IntegrationStepType.EMAIL:
      return sendEmail(step, variables)
  }
}

export const executeGoogleAnalyticsIntegration = async (
  step: GoogleAnalyticsStep,
  variables: Variable[]
) => {
  if (!step.options?.trackingId) return step.outgoingEdgeId
  const { default: initGoogleAnalytics } = await import('../../lib/gtag')
  await initGoogleAnalytics(step.options.trackingId)
  sendGaEvent(parseVariablesInObject(step.options, variables))
  return step.outgoingEdgeId
}

const executeGoogleSheetIntegration = async (
  step: GoogleSheetsStep,
  variables: Variable[],
  updateVariableValue: (variableId: string, value: string) => void
) => {
  if (!('action' in step.options)) return step.outgoingEdgeId
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
  return step.outgoingEdgeId
}

const insertRowInGoogleSheets = async (
  options: GoogleSheetsInsertRowOptions,
  variables: Variable[]
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
  variables: Variable[]
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
        value: parseVariables(variables)(options.referenceCell.value ?? ''),
      },
    },
  })
}

const getRowFromGoogleSheets = async (
  options: GoogleSheetsGetOptions,
  variables: Variable[],
  updateVariableValue: (variableId: string, value: string) => void
) => {
  if (!options.referenceCell || !options.cellsToExtract) return
  const queryParams = stringify(
    {
      credentialsId: options.credentialsId,
      referenceCell: {
        column: options.referenceCell.column,
        value: parseVariables(variables)(options.referenceCell.value ?? ''),
      },
      columns: options.cellsToExtract.map((cell) => cell.column),
    },
    { indices: false }
  )
  const { data } = await sendRequest<{ [key: string]: string }>({
    url: `http://localhost:3001/api/integrations/google-sheets/spreadsheets/${options.spreadsheetId}/sheets/${options.sheetId}?${queryParams}`,
    method: 'GET',
  })
  if (!data) return
  options.cellsToExtract.forEach((cell) =>
    updateVariableValue(cell.variableId ?? '', data[cell.column ?? ''])
  )
}
const parseCellValues = (
  cells: Cell[],
  variables: Variable[]
): { [key: string]: string } =>
  cells.reduce((row, cell) => {
    return !cell.column || !cell.value
      ? row
      : {
          ...row,
          [cell.column]: parseVariables(variables)(cell.value),
        }
  }, {})

const executeWebhook = async (
  typebotId: string,
  step: WebhookStep,
  variables: Variable[],
  indices: Indices,
  updateVariableValue: (variableId: string, value: string) => void
) => {
  if (!step.webhook) return step.outgoingEdgeId
  const { blockIndex, stepIndex } = indices
  const { data, error } = await sendRequest({
    url: `http://localhost:3000/api/typebots/${typebotId}/blocks/${blockIndex}/steps/${stepIndex}/executeWebhook`,
    method: 'POST',
    body: {
      variables,
    },
  })
  console.error(error)
  step.options.responseVariableMapping.forEach((varMapping) => {
    if (!varMapping?.bodyPath || !varMapping.variableId) return
    const value = safeEval(`(${JSON.stringify(data)}).${varMapping?.bodyPath}`)
    updateVariableValue(varMapping.variableId, value)
  })
}

const sendEmail = async (step: SendEmailStep, variables: Variable[]) => {
  const { options } = step
  const { error } = await sendRequest({
    url: `http://localhost:3001/api/integrations/email`,
    method: 'POST',
    body: {
      credentialsId: options.credentialsId,
      recipients: options.recipients.map(parseVariables(variables)),
      subject: parseVariables(variables)(options.subject ?? ''),
      body: parseVariables(variables)(options.body ?? ''),
    },
  })
  console.error(error)
  return step.outgoingEdgeId
}
