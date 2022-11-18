import { trpc } from '@/lib/trpc'

export const useResultsQuery = ({
  typebotId,
  onError,
}: {
  typebotId: string
  onError?: (error: string) => void
}) => {
  const { data, error, fetchNextPage, hasNextPage, refetch } =
    trpc.results.getResults.useInfiniteQuery(
      {
        typebotId,
        limit: '50',
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
