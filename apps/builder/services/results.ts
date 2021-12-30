import { Result } from 'bot-engine'
import useSWR from 'swr'
import { fetcher } from './utils'
import { stringify } from 'qs'
import { Answer } from 'db'

export const useResults = ({
  lastResultId,
  typebotId,
  onError,
}: {
  lastResultId?: string
  typebotId: string
  onError: (error: Error) => void
}) => {
  const params = stringify({
    lastResultId,
  })
  const { data, error, mutate } = useSWR<
    { results: (Result & { answers: Answer[] })[] },
    Error
  >(`/api/typebots/${typebotId}/results?${params}`, fetcher)
  if (error) onError(error)
  return {
    results: data?.results,
    isLoading: !error && !data,
    mutate,
  }
}

export const useResultsCount = ({
  typebotId,
  onError,
}: {
  typebotId?: string
  onError: (error: Error) => void
}) => {
  const { data, error, mutate } = useSWR<{ totalResults: number }, Error>(
    typebotId ? `/api/typebots/${typebotId}/results/count` : null,
    fetcher
  )
  if (error) onError(error)
  return {
    totalResults: data?.totalResults,
    isLoading: !error && !data,
    mutate,
  }
}

export const parseDateToReadable = (dateStr: string): string => {
  const date = new Date(dateStr)
  return (
    date.toDateString().split(' ').slice(1, 3).join(' ') +
    ', ' +
    date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  )
}
