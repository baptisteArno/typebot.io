import { sendRequest } from 'utils'
import { stringify } from 'qs'
import useSWR from 'swr'
import { fetcher } from './utils'
import { Table, Variable, VariableForTest, WebhookResponse } from 'models'

export const getGoogleSheetsConsentScreenUrl = (
  redirectUrl: string,
  stepId: string
) => {
  const queryParams = stringify({ redirectUrl, stepId })
  return `/api/credentials/google-sheets/consent-url?${queryParams}`
}

export const createSheetsAccount = async (code: string) => {
  const queryParams = stringify({ code })
  return sendRequest({
    url: `/api/credentials/google-sheets/callback?${queryParams}`,
    method: 'GET',
  })
}

export type Spreadsheet = { id: string; name: string }
export const useSpreadsheets = ({
  credentialsId,
  onError,
}: {
  credentialsId: string
  onError?: (error: Error) => void
}) => {
  const queryParams = stringify({ credentialsId })
  const { data, error, mutate } = useSWR<{ files: Spreadsheet[] }, Error>(
    `/api/integrations/google-sheets/spreadsheets?${queryParams}`,
    fetcher
  )
  if (error) onError && onError(error)
  return {
    spreadsheets: data?.files,
    isLoading: !error && !data,
    mutate,
  }
}

export type Sheet = { id: string; name: string; columns: string[] }
export const useSheets = ({
  credentialsId,
  spreadsheetId,
  onError,
}: {
  credentialsId?: string
  spreadsheetId?: string
  onError?: (error: Error) => void
}) => {
  const queryParams = stringify({ credentialsId })
  const { data, error, mutate } = useSWR<{ sheets: Sheet[] }, Error>(
    !credentialsId || !spreadsheetId
      ? null
      : `/api/integrations/google-sheets/spreadsheets/${spreadsheetId}/sheets?${queryParams}`,
    fetcher
  )
  if (error) onError && onError(error)
  return {
    sheets: data?.sheets,
    isLoading: !error && !data,
    mutate,
  }
}

export const executeWebhook = (
  typebotId: string,
  webhookId: string,
  variables: Table<Variable>
) =>
  sendRequest<WebhookResponse>({
    url: `/api/typebots/${typebotId}/webhooks/${webhookId}/execute`,
    method: 'POST',
    body: {
      variables,
    },
  })

export const convertVariableForTestToVariables = (
  variablesForTest: Table<VariableForTest> | undefined,
  variables: Table<Variable>
): Table<Variable> => {
  if (!variablesForTest) return { byId: {}, allIds: [] }
  return {
    byId: {
      ...variables.byId,
      ...variablesForTest.allIds.reduce((obj, id) => {
        const variableForTest = variablesForTest.byId[id]
        if (!variableForTest.variableId) return {}
        const variable = variables.byId[variableForTest.variableId ?? '']
        return {
          ...obj,
          [variableForTest.variableId]: {
            ...variable,
            value: variableForTest.value,
          },
        }
      }, {}),
    },
    allIds: variables.allIds,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getDeepKeys = (obj: any): string[] => {
  let keys: string[] = []
  for (const key in obj) {
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      const subkeys = getDeepKeys(obj[key])
      keys = keys.concat(
        subkeys.map(function (subkey) {
          return key + '.' + subkey
        })
      )
    } else if (Array.isArray(obj[key])) {
      for (let i = 0; i < obj[key].length; i++) {
        const subkeys = getDeepKeys(obj[key][i])
        keys = keys.concat(
          subkeys.map(function (subkey) {
            return key + '[' + i + ']' + '.' + subkey
          })
        )
      }
    } else {
      keys.push(key)
    }
  }
  return keys
}
