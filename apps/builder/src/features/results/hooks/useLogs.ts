import { fetcher } from '@/utils/helpers'
import { Log } from 'db'
import useSWR from 'swr'

export const useLogs = (
  typebotId: string,
  resultId?: string,
  onError?: (e: Error) => void
) => {
  const { data, error } = useSWR<{ logs: Log[] }>(
    resultId ? `/api/typebots/${typebotId}/results/${resultId}/logs` : null,
    fetcher
  )
  if (error && onError) onError(error)
  return {
    logs: data?.logs,
    isLoading: !error && !data,
  }
}
