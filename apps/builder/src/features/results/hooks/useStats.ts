import { Stats } from '@typebot.io/schemas'
import { fetcher } from '@/helpers/fetcher'
import useSWR from 'swr'

export const useStats = ({
  typebotId,
  onError,
}: {
  typebotId?: string
  onError: (error: Error) => void
}) => {
  const { data, error, mutate } = useSWR<{ stats: Stats }, Error>(
    typebotId ? `/api/typebots/${typebotId}/analytics/stats` : null,
    fetcher
  )
  if (error) onError(error)
  return {
    stats: data?.stats,
    isLoading: !error && !data,
    mutate,
  }
}
