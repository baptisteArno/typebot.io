import { config } from 'config/octadesk.config'
import { Log } from 'model'
import { fetcher } from 'services/utils'
import useSWR from 'swr'

export const useLogs = (
  typebotId: string,
  resultId?: string,
  onError?: (e: Error) => void
) => {
  const { data, error } = useSWR<{ logs: Log[] }>(
    resultId ? `${config.basePath || ''}/api/typebots/${typebotId}/results/${resultId}/logs` : null,
    fetcher
  )
  if (error && onError) onError(error)
  return {
    logs: data?.logs,
    isLoading: !error && !data,
  }
}
