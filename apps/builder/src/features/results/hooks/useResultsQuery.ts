import { timeFilterValues } from '@/features/analytics/constants'
import { trpc } from '@/lib/trpc'

type Params = {
  timeFilter: (typeof timeFilterValues)[number]
  sniperId: string
  onError?: (error: string) => void
}

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

export const useResultsQuery = ({ timeFilter, sniperId, onError }: Params) => {
  const { data, error, fetchNextPage, hasNextPage, refetch } =
    trpc.results.getResults.useInfiniteQuery(
      {
        timeZone,
        timeFilter,
        sniperId,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    )

  if (error && onError) onError(error.message)
  return {
    data: data?.pages,
    isLoading: !error && !data,
    fetchNextPage,
    hasNextPage,
    refetch,
  }
}
