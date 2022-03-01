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
  ZapierStep,
  ResultValues,
  Block,
} from 'models'
import { stringify } from 'qs'
import { sendRequest } from 'utils'
import { sendGaEvent } from '../../lib/gtag'
import { sendErrorMessage, sendInfoMessage } from './postMessage'
import { parseVariables, parseVariablesInObject } from './variable'

const safeEval = eval

type IntegrationContext = {
  apiHost: string
  typebotId: string
  blockId: string
  stepId: string
  isPreview: boolean
  variables: Variable[]
  resultValues: ResultValues
  blocks: Block[]
  updateVariableValue: (variableId: string, value: string) => void
}

export const executeIntegration = ({
  step,
  context,
}: {
  step: IntegrationStep
  context: IntegrationContext
}): Promise<string | undefined> => {
  switch (step.type) {
    case IntegrationStepType.GOOGLE_SHEETS:
      return executeGoogleSheetIntegration(step, context)
    case IntegrationStepType.GOOGLE_ANALYTICS:
      return executeGoogleAnalyticsIntegration(step, context)
    case IntegrationStepType.ZAPIER:
    case IntegrationStepType.WEBHOOK:
      return executeWebhook(step, context)
    case IntegrationStepType.EMAIL:
      return sendEmail(step, context)
  }
}

export const executeGoogleAnalyticsIntegration = async (
  step: GoogleAnalyticsStep,
  { variables }: IntegrationContext
) => {
  if (!step.options?.trackingId) return step.outgoingEdgeId
  const { default: initGoogleAnalytics } = await import('../../lib/gtag')
  await initGoogleAnalytics(step.options.trackingId)
  sendGaEvent(parseVariablesInObject(step.options, variables))
  return step.outgoingEdgeId
}

const executeGoogleSheetIntegration = async (
  step: GoogleSheetsStep,
  context: IntegrationContext
) => {
  if (!('action' in step.options)) return step.outgoingEdgeId
  switch (step.options.action) {
    case GoogleSheetsAction.INSERT_ROW:
      await insertRowInGoogleSheets(step.options, context)
      break
    case GoogleSheetsAction.UPDATE_ROW:
      await updateRowInGoogleSheets(step.options, context)
      break
    case GoogleSheetsAction.GET:
      await getRowFromGoogleSheets(step.options, context)
      break
  }
  return step.outgoingEdgeId
}

const insertRowInGoogleSheets = async (
  options: GoogleSheetsInsertRowOptions,
  { variables, apiHost }: IntegrationContext
) => {
  if (!options.cellsToInsert) return
  return sendRequest({
    url: `${apiHost}/api/integrations/google-sheets/spreadsheets/${options.spreadsheetId}/sheets/${options.sheetId}`,
    method: 'POST',
    body: {
      credentialsId: options.credentialsId,
      values: parseCellValues(options.cellsToInsert, variables),
    },
  })
}

const updateRowInGoogleSheets = async (
  options: GoogleSheetsUpdateRowOptions,
  { variables, apiHost }: IntegrationContext
) => {
  if (!options.cellsToUpsert || !options.referenceCell) return
  return sendRequest({
    url: `${apiHost}/api/integrations/google-sheets/spreadsheets/${options.spreadsheetId}/sheets/${options.sheetId}`,
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
  { variables, updateVariableValue, apiHost }: IntegrationContext
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
    url: `${apiHost}/api/integrations/google-sheets/spreadsheets/${options.spreadsheetId}/sheets/${options.sheetId}?${queryParams}`,
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
  step: WebhookStep | ZapierStep,
  {
    blockId,
    stepId,
    variables,
    updateVariableValue,
    typebotId,
    apiHost,
    resultValues,
    isPreview,
  }: IntegrationContext
) => {
  const { data, error } = await sendRequest({
    url: `${apiHost}/api/typebots/${typebotId}/blocks/${blockId}/steps/${stepId}/executeWebhook`,
    method: 'POST',
    body: {
      variables,
      resultValues,
    },
  })
  console.error(error)
  if (isPreview && error) sendErrorMessage(`Webhook failed: ${error.message}`)
  step.options.responseVariableMapping.forEach((varMapping) => {
    if (!varMapping?.bodyPath || !varMapping.variableId) return
    const value = safeEval(`(${JSON.stringify(data)}).${varMapping?.bodyPath}`)
    updateVariableValue(varMapping.variableId, value)
  })
  return step.outgoingEdgeId
}

const sendEmail = async (
  step: SendEmailStep,
  { variables, apiHost, isPreview }: IntegrationContext
) => {
  if (isPreview) sendInfoMessage('Emails are not sent in preview mode')
  if (isPreview) return step.outgoingEdgeId
  const { options } = step
  const { error } = await sendRequest({
    url: `${apiHost}/api/integrations/email`,
    method: 'POST',
    body: {
      credentialsId: options.credentialsId,
      recipients: options.recipients.map(parseVariables(variables)),
      subject: parseVariables(variables)(options.subject ?? ''),
      body: parseVariables(variables)(options.body ?? ''),
      cc: (options.cc ?? []).map(parseVariables(variables)),
      bcc: (options.bcc ?? []).map(parseVariables(variables)),
    },
  })
  console.error(error)
  return step.outgoingEdgeId
}
