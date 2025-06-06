import type { timeFilterValues } from "@/features/analytics/constants";
import { trpc } from "@/lib/queryClient";
import { useInfiniteQuery } from "@tanstack/react-query";

type Params = {
  timeFilter: (typeof timeFilterValues)[number];
  typebotId: string;
  onError?: (error: string) => void;
};

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const useResultsQuery = ({ timeFilter, typebotId, onError }: Params) => {
  const { data, error, fetchNextPage, hasNextPage, refetch } = useInfiniteQuery(
    trpc.results.getResults.infiniteQueryOptions(
      {
        timeZone,
        timeFilter,
        typebotId,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );

  if (error && onError) onError(error.message);
  return {
    data: data?.pages,
    isLoading: !error && !data,
    fetchNextPage,
    hasNextPage,
    refetch,
  };
};
