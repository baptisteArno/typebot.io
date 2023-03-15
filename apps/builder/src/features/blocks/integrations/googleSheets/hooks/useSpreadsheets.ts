import { stringify } from 'qs'
import { fetcher } from '@/helpers/fetcher'
import useSWR from 'swr'
import { Spreadsheet } from '../types'

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
