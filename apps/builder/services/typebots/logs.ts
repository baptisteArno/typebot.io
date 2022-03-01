import { Log } from 'db'
import { fetcher } from 'services/utils'
import useSWR from 'swr'

export const useLogs = (resultId?: string, onError?: (e: Error) => void) => {
  const { data, error } = useSWR<{ logs: Log[] }>(
    resultId ? `/api/typebots/t/results/${resultId}/logs` : null,
    fetcher
  )
  if (error && onError) onError(error)
  return {
    logs: data?.logs,
    isLoading: !error && !data,
  }
}
