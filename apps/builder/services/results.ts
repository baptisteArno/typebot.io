import { Result } from 'models'
import useSWRInfinite from 'swr/infinite'
import { fetcher } from './utils'
import { stringify } from 'qs'
import { Answer } from 'db'
import { sendRequest } from 'utils'

const paginationLimit = 50

const getKey = (
  typebotId: string,
  pageIndex: number,
  previousPageData: {
    results: ResultWithAnswers[]
  }
) => {
  if (previousPageData && previousPageData.results.length === 0) return null
  if (pageIndex === 0) return `/api/typebots/${typebotId}/results?limit=50`
  return `/api/typebots/${typebotId}/results?lastResultId=${
    previousPageData.results[previousPageData.results.length - 1].id
  }&limit=${paginationLimit}`
}

export type ResultWithAnswers = Result & { answers: Answer[] }
export const useResults = ({
  typebotId,
  onError,
}: {
  typebotId: string
  onError: (error: Error) => void
}) => {
  const { data, error, mutate, setSize, size } = useSWRInfinite<
    { results: ResultWithAnswers[] },
    Error
  >(
    (
      pageIndex: number,
      previousPageData: {
        results: ResultWithAnswers[]
      }
    ) => getKey(typebotId, pageIndex, previousPageData),
    fetcher,
    { revalidateAll: true }
  )

  if (error) onError(error)
  return {
    data,
    isLoading: !error && !data,
    mutate,
    setSize,
    size,
    hasMore:
      data &&
      data.length > 0 &&
      data[data.length - 1].results.length > 0 &&
      data.length === paginationLimit,
  }
}

export const deleteResults = async (typebotId: string, ids: string[]) => {
  const params = stringify(
    {
      ids,
    },
    { indices: false }
  )
  return sendRequest({
    url: `/api/typebots/${typebotId}/results?${params}`,
    method: 'DELETE',
  })
}

export const deleteAllResults = async (typebotId: string) =>
  sendRequest({
    url: `/api/typebots/${typebotId}/results`,
    method: 'DELETE',
  })

export const getAllResults = async (typebotId: string) =>
  sendRequest<{ results: ResultWithAnswers[] }>({
    url: `/api/typebots/${typebotId}/results`,
    method: 'GET',
  })

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

export const convertResultsToTableData = (results?: ResultWithAnswers[]) =>
  (results ?? []).map((result) => ({
    createdAt: parseDateToReadable(result.createdAt),
    ...result.answers.reduce(
      (o, answer) => ({ ...o, [answer.blockId]: answer.content }),
      {}
    ),
  }))
