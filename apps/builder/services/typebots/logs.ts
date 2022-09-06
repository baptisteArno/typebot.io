import { Log } from 'model'
import { fetcher } from 'services/utils'
import useSWR from 'swr'

export const useLogs = (
  typebotId: string,
  resultId?: string,
  onError?: (e: Error) => void
) => {
  const { data, error } = useSWR<{ logs: Log[] }>(
    resultId ? `${process.env.BASE_PATH || ''}/api/typebots/${typebotId}/results/${resultId}/logs` : null,
    fetcher
  )
  if (error && onError) onError(error)
  return {
    logs: data?.logs,
    isLoading: !error && !data,
  }
}
