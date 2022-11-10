import { Log } from 'db'
import { openChatwootWidget } from 'features/chatwoot'
import {
  IntegrationBlock,
  IntegrationBlockType,
  GoogleSheetsBlock,
  GoogleSheetsAction,
  GoogleSheetsInsertRowOptions,
  Variable,
  GoogleSheetsUpdateRowOptions,
  Cell,
  GoogleSheetsGetOptions,
  GoogleAnalyticsBlock,
  WebhookBlock,
  SendEmailBlock,
  ZapierBlock,
  ResultValues,
  Group,
  VariableWithValue,
  MakeComBlock,
  PabblyConnectBlock,
  VariableWithUnknowValue,
} from 'models'
import { stringify } from 'qs'
import { byId, sendRequest } from 'utils'
import { sendGaEvent } from '../../lib/gtag'
import { parseVariables, parseVariablesInObject } from './variable'

export type IntegrationContext = {
  apiHost: string
  typebotId: string
  groupId: string
  blockId: string
  isPreview: boolean
  variables: Variable[]
  resultValues: ResultValues
  groups: Group[]
  resultId?: string
  updateVariables: (variables: VariableWithUnknowValue[]) => void
  updateVariableValue: (variableId: string, value: unknown) => void
  onNewLog: (log: Omit<Log, 'id' | 'createdAt' | 'resultId'>) => void
}

export const executeIntegration = ({
  block,
  context,
}: {
  block: IntegrationBlock
  context: IntegrationContext
}): Promise<string | undefined> => {
  switch (block.type) {
    case IntegrationBlockType.GOOGLE_SHEETS:
      return executeGoogleSheetIntegration(block, context)
    case IntegrationBlockType.GOOGLE_ANALYTICS:
      return executeGoogleAnalyticsIntegration(block, context)
    case IntegrationBlockType.ZAPIER:
    case IntegrationBlockType.MAKE_COM:
    case IntegrationBlockType.PABBLY_CONNECT:
    case IntegrationBlockType.WEBHOOK:
      return executeWebhook(block, context)
    case IntegrationBlockType.EMAIL:
      return sendEmail(block, context)
    case IntegrationBlockType.CHATWOOT:
      return openChatwootWidget(block, context)
  }
}

export const executeGoogleAnalyticsIntegration = async (
  block: GoogleAnalyticsBlock,
  { variables }: IntegrationContext
) => {
  if (!block.options?.trackingId) return block.outgoingEdgeId
  const { default: initGoogleAnalytics } = await import('../../lib/gtag')
  await initGoogleAnalytics(block.options.trackingId)
  sendGaEvent(parseVariablesInObject(block.options, variables))
  return block.outgoingEdgeId
}

const executeGoogleSheetIntegration = async (
  block: GoogleSheetsBlock,
  context: IntegrationContext
) => {
  if (!('action' in block.options)) return block.outgoingEdgeId
  switch (block.options.action) {
    case GoogleSheetsAction.INSERT_ROW:
      await insertRowInGoogleSheets(block.options, context)
      break
    case GoogleSheetsAction.UPDATE_ROW:
      await updateRowInGoogleSheets(block.options, context)
      break
    case GoogleSheetsAction.GET:
      await getRowFromGoogleSheets(block.options, context)
      break
  }
  return block.outgoingEdgeId
}

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
      const value = data[cell.column ?? ''] ?? null
      if (!existingVariable) return newVariables
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

const executeWebhook = async (
  block: WebhookBlock | ZapierBlock | MakeComBlock | PabblyConnectBlock,
  {
    blockId,
    variables,
    updateVariableValue,
    updateVariables,
    typebotId,
    apiHost,
    resultValues,
    onNewLog,
    resultId,
  }: IntegrationContext
) => {
  const params = stringify({ resultId })
  const { data, error } = await sendRequest({
    url: `${apiHost}/api/typebots/${typebotId}/blocks/${blockId}/executeWebhook?${params}`,
    method: 'POST',
    body: {
      variables,
      resultValues,
    },
  })
  const statusCode = (
    data as Record<string, string> | undefined
  )?.statusCode.toString()
  const isError = statusCode
    ? statusCode?.startsWith('4') || statusCode?.startsWith('5')
    : true
  onNewLog({
    status: error ? 'error' : isError ? 'warning' : 'success',
    description: isError
      ? 'Webhook returned an error'
      : 'Webhook successfuly executed',
    details: JSON.stringify(error ?? data, null, 2).substring(0, 1000),
  })
  const newVariables = block.options.responseVariableMapping.reduce<
    VariableWithUnknowValue[]
  >((newVariables, varMapping) => {
    if (!varMapping?.bodyPath || !varMapping.variableId) return newVariables
    const existingVariable = variables.find(byId(varMapping.variableId))
    if (!existingVariable) return newVariables
    const func = Function(
      'data',
      `return data.${parseVariables(variables)(varMapping?.bodyPath)}`
    )
    try {
      const value: unknown = func(data)
      updateVariableValue(existingVariable?.id, value)
      return [...newVariables, { ...existingVariable, value }]
    } catch (err) {
      return newVariables
    }
  }, [])
  updateVariables(newVariables)
  return block.outgoingEdgeId
}

const sendEmail = async (
  block: SendEmailBlock,
  {
    variables,
    apiHost,
    isPreview,
    onNewLog,
    resultId,
    typebotId,
    resultValues,
  }: IntegrationContext
) => {
  if (isPreview) {
    onNewLog({
      status: 'info',
      description: 'Emails are not sent in preview mode',
      details: null,
    })
    return block.outgoingEdgeId
  }
  const { options } = block
  const { error } = await sendRequest({
    url: `${apiHost}/api/typebots/${typebotId}/integrations/email?resultId=${resultId}`,
    method: 'POST',
    body: {
      credentialsId: options.credentialsId,
      recipients: options.recipients.map(parseVariables(variables)),
      subject: parseVariables(variables)(options.subject ?? ''),
      body: parseVariables(variables)(options.body ?? ''),
      cc: (options.cc ?? []).map(parseVariables(variables)),
      bcc: (options.bcc ?? []).map(parseVariables(variables)),
      replyTo: options.replyTo
        ? parseVariables(variables)(options.replyTo)
        : undefined,
      fileUrls: variables.find(byId(options.attachmentsVariableId))?.value,
      isCustomBody: options.isCustomBody,
      isBodyCode: options.isBodyCode,
      resultValues,
    },
  })
  onNewLog(
    parseLog(error, 'Succesfully sent an email', 'Failed to send an email')
  )
  return block.outgoingEdgeId
}

const parseLog = (
  error: Error | undefined,
  successMessage: string,
  errorMessage: string
): Omit<Log, 'id' | 'createdAt' | 'resultId'> => ({
  status: error ? 'error' : 'success',
  description: error ? errorMessage : successMessage,
  details: (error && JSON.stringify(error, null, 2).substring(0, 1000)) ?? null,
})
