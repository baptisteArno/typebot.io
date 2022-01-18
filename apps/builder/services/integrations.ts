import { sendRequest } from 'utils'
import { stringify } from 'qs'
import useSWR from 'swr'
import { fetcher } from './utils'

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
