import { fetcher } from '@/utils/helpers'
import { ResultWithAnswers } from 'models'
import { env } from 'utils'
import useSWRInfinite from 'swr/infinite'

const paginationLimit = 50

export const useResultsQuery = ({
  workspaceId,
  typebotId,
  onError,
}: {
  workspaceId: string
  typebotId: string
  onError?: (error: Error) => void
}) => {
  const { data, error, mutate, setSize, size, isValidating } = useSWRInfinite<
    { results: ResultWithAnswers[] },
    Error
  >(
    (
      pageIndex: number,
      previousPageData: {
        results: ResultWithAnswers[]
      }
    ) => getKey(workspaceId, typebotId, pageIndex, previousPageData),
    fetcher,
    {
      revalidateAll: true,
      dedupingInterval: env('E2E_TEST') === 'true' ? 0 : undefined,
    }
  )

  if (error && onError) onError(error)
  return {
    data,
    isLoading: !error && !data,
    mutate,
    setSize,
    size,
    hasMore:
      isValidating ||
      (data &&
        data.length > 0 &&
        data[data.length - 1].results.length > 0 &&
        data.length === paginationLimit),
  }
}

const getKey = (
  workspaceId: string,
  typebotId: string,
  pageIndex: number,
  previousPageData: {
    results: ResultWithAnswers[]
  }
) => {
  if (previousPageData && previousPageData.results.length === 0) return null
  if (pageIndex === 0)
    return `/api/typebots/${typebotId}/results?limit=50&workspaceId=${workspaceId}`
  return `/api/typebots/${typebotId}/results?lastResultId=${
    previousPageData.results[previousPageData.results.length - 1].id
  }&limit=${paginationLimit}&workspaceId=${workspaceId}`
}
