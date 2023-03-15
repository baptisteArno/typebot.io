import { stringify } from 'qs'
import { fetcher } from '@/helpers/fetcher'
import useSWR from 'swr'
import { Sheet } from '../types'

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
