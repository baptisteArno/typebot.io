import { useInfiniteQuery } from "@tanstack/react-query";
import type { timeFilterValues } from "@/features/analytics/constants";
import { orpc } from "@/lib/queryClient";

type Params = {
  timeFilter: (typeof timeFilterValues)[number];
  typebotId: string;
  onError?: (error: string) => void;
};

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const useResultsQuery = ({ timeFilter, typebotId, onError }: Params) => {
  const { data, error, fetchNextPage, hasNextPage, refetch } = useInfiniteQuery(
    orpc.results.getResults.infiniteOptions({
      input: (cursor: number) => ({
        cursor,
        timeZone,
        timeFilter,
        typebotId,
      }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }),
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
