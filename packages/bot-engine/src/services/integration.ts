import { Log } from 'db'
import {
  IntegrationStep,
  IntegrationStepType,
  // GoogleSheetsStep,
  GoogleSheetsAction,
  GoogleSheetsInsertRowOptions,
  Variable,
  GoogleSheetsUpdateRowOptions,
  Cell,
  GoogleSheetsGetOptions,
  // GoogleAnalyticsStep,
  WebhookStep,
  // SendEmailStep,
  // ZapierStep,
  ResultValues,
  Block,
  VariableWithValue,
  // MakeComStep,
  // PabblyConnectStep,
} from 'models'
import { stringify } from 'qs'
import { byId, sendRequest } from 'utils'
import { sendGaEvent } from '../../lib/gtag'
import { parseVariables, parseVariablesInObject } from './variable'

type IntegrationContext = {
  apiHost: string
  typebotId: string
  blockId: string
  stepId: string
  isPreview: boolean
  variables: Variable[]
  resultValues: ResultValues
  blocks: Block[]
  resultId?: string
  updateVariables: (variables: VariableWithValue[]) => void
  updateVariableValue: (variableId: string, value: string) => void
  onNewLog: (log: Omit<Log, 'id' | 'createdAt' | 'resultId'>) => void
}

// export const executeIntegration = ({
//   step,
//   context,
// }: {
//   step: IntegrationStep
//   context: IntegrationContext
// }): Promise<string | undefined> => {
//   switch (step.type) {
//     case IntegrationStepType.GOOGLE_SHEETS:
//       return executeGoogleSheetIntegration(step, context)
//     case IntegrationStepType.GOOGLE_ANALYTICS:
//       return executeGoogleAnalyticsIntegration(step, context)
//     case IntegrationStepType.ZAPIER:
//     case IntegrationStepType.MAKE_COM:
//     case IntegrationStepType.PABBLY_CONNECT:
//     case IntegrationStepType.WEBHOOK:
//       return executeWebhook(step, context)
//     case IntegrationStepType.EMAIL:
//       return sendEmail(step, context)
//   }
// }

// export const executeGoogleAnalyticsIntegration = async (
//   step: GoogleAnalyticsStep,
//   { variables }: IntegrationContext
// ) => {
//   if (!step.options?.trackingId) return step.outgoingEdgeId
//   const { default: initGoogleAnalytics } = await import('../../lib/gtag')
//   await initGoogleAnalytics(step.options.trackingId)
//   sendGaEvent(parseVariablesInObject(step.options, variables))
//   return step.outgoingEdgeId
// }

// const executeGoogleSheetIntegration = async (
//   step: GoogleSheetsStep,
//   context: IntegrationContext
// ) => {
//   if (!('action' in step.options)) return step.outgoingEdgeId
//   switch (step.options.action) {
//     case GoogleSheetsAction.INSERT_ROW:
//       await insertRowInGoogleSheets(step.options, context)
//       break
//     case GoogleSheetsAction.UPDATE_ROW:
//       await updateRowInGoogleSheets(step.options, context)
//       break
//     case GoogleSheetsAction.GET:
//       await getRowFromGoogleSheets(step.options, context)
//       break
//   }
//   return step.outgoingEdgeId
// }

const insertRowInGoogleSheets = async (
  options: GoogleSheetsInsertRowOptions,
  { variables, apiHost, onNewLog, resultId }: IntegrationContext
) => {
  if (!options.cellsToInsert) {
    onNewLog({
      status: 'warning',
      description: 'Cells to insert are undefined',
      details: null,
    })
    return
  }
  const params = stringify({ resultId })
  const { error } = await sendRequest({
    url: `${apiHost}/api/integrations/google-sheets/spreadsheets/${options.spreadsheetId}/sheets/${options.sheetId}?${params}`,
    method: 'POST',
    body: {
      credentialsId: options.credentialsId,
      values: parseCellValues(options.cellsToInsert, variables),
    },
  })
  onNewLog(
    parseLog(
      error,
      'Succesfully inserted a row in the sheet',
      'Failed to insert a row in the sheet'
    )
  )
}

const updateRowInGoogleSheets = async (
  options: GoogleSheetsUpdateRowOptions,
  { variables, apiHost, onNewLog, resultId }: IntegrationContext
) => {
  if (!options.cellsToUpsert || !options.referenceCell) return
  const params = stringify({ resultId })
  const { error } = await sendRequest({
    url: `${apiHost}/api/integrations/google-sheets/spreadsheets/${options.spreadsheetId}/sheets/${options.sheetId}?${params}`,
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
  onNewLog(
    parseLog(
      error,
      'Succesfully updated a row in the sheet',
      'Failed to update a row in the sheet'
    )
  )
}

const getRowFromGoogleSheets = async (
  options: GoogleSheetsGetOptions,
  {
    variables,
    updateVariableValue,
    updateVariables,
    apiHost,
    onNewLog,
    resultId,
  }: IntegrationContext
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
      resultId,
    },
    { indices: false }
  )
  const { data, error } = await sendRequest<{ [key: string]: string }>({
    url: `${apiHost}/api/integrations/google-sheets/spreadsheets/${options.spreadsheetId}/sheets/${options.sheetId}?${queryParams}`,
    method: 'GET',
  })
  onNewLog(
    parseLog(
      error,
      'Succesfully fetched data from sheet',
      'Failed to fetch data from sheet'
    )
  )
  if (!data) return
  const newVariables = options.cellsToExtract.reduce<VariableWithValue[]>(
    (newVariables, cell) => {
      const existingVariable = variables.find(byId(cell.variableId))
      const value = data[cell.column ?? '']
      if (!existingVariable || !value) return newVariables
      updateVariableValue(existingVariable.id, value)
      return [
        ...newVariables,
        {
          ...existingVariable,
          value,
        },
      ]
    },
    []
  )
  updateVariables(newVariables)
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

// const executeWebhook = async (
//   step: WebhookStep | ZapierStep | MakeComStep | PabblyConnectStep,
//   {
//     blockId,
//     stepId,
//     variables,
//     updateVariableValue,
//     updateVariables,
//     typebotId,
//     apiHost,
//     resultValues,
//     onNewLog,
//     resultId,
//   }: IntegrationContext
// ) => {
//   const params = stringify({ resultId })
//   const { data, error } = await sendRequest({
//     url: `${apiHost}/api/typebots/${typebotId}/blocks/${blockId}/steps/${stepId}/executeWebhook?${params}`,
//     method: 'POST',
//     body: {
//       variables,
//       resultValues,
//     },
//   })
//   const statusCode = (
//     data as Record<string, string> | undefined
//   )?.statusCode.toString()
//   const isError = statusCode
//     ? statusCode?.startsWith('4') || statusCode?.startsWith('5')
//     : true
//   onNewLog({
//     status: error ? 'error' : isError ? 'warning' : 'success',
//     description: isError
//       ? 'Webhook returned an error'
//       : 'Webhook successfuly executed',
//     details: JSON.stringify(error ?? data, null, 2).substring(0, 1000),
//   })
//   const newVariables = step.options.responseVariableMapping.reduce<
//     VariableWithValue[]
//   >((newVariables, varMapping) => {
//     if (!varMapping?.bodyPath || !varMapping.variableId) return newVariables
//     const existingVariable = variables.find(byId(varMapping.variableId))
//     if (!existingVariable) return newVariables
//     const func = Function(
//       'data',
//       `return data.${parseVariables(variables)(varMapping?.bodyPath)}`
//     )
//     try {
//       const value = func(data)
//       updateVariableValue(existingVariable?.id, value)
//       return [...newVariables, { ...existingVariable, value }]
//     } catch (err) {
//       return newVariables
//     }
//   }, [])
//   updateVariables(newVariables)
//   return step.outgoingEdgeId
// }

// const sendEmail = async (
//   step: SendEmailStep,
//   { variables, apiHost, isPreview, onNewLog, resultId }: IntegrationContext
// ) => {
//   if (isPreview) {
//     onNewLog({
//       status: 'info',
//       description: 'Emails are not sent in preview mode',
//       details: null,
//     })
//     return step.outgoingEdgeId
//   }
//   const { options } = step
//   const replyTo = parseVariables(variables)(options.replyTo)
//   const { error } = await sendRequest({
//     url: `${apiHost}/api/integrations/email?resultId=${resultId}`,
//     method: 'POST',
//     body: {
//       credentialsId: options.credentialsId,
//       recipients: options.recipients.map(parseVariables(variables)),
//       subject: parseVariables(variables)(options.subject ?? ''),
//       body: parseVariables(variables)(options.body ?? ''),
//       cc: (options.cc ?? []).map(parseVariables(variables)),
//       bcc: (options.bcc ?? []).map(parseVariables(variables)),
//       replyTo: replyTo !== '' ? replyTo : undefined,
//     },
//   })
//   onNewLog(
//     parseLog(error, 'Succesfully sent an email', 'Failed to send an email')
//   )
//   return step.outgoingEdgeId
// }

const parseLog = (
  error: Error | undefined,
  successMessage: string,
  errorMessage: string
): Omit<Log, 'id' | 'createdAt' | 'resultId'> => ({
  status: error ? 'error' : 'success',
  description: error ? errorMessage : successMessage,
  details: (error && JSON.stringify(error, null, 2).substring(0, 1000)) ?? null,
})
