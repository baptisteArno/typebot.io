import { trpc } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { isDefined } from "@typebot.io/lib/utils";

export const useLogs = (
  typebotId: string,
  resultId: string | null,
  onError?: (error: string) => void,
) => {
  const { data, error } = useQuery(
    trpc.results.getResultLogs.queryOptions(
      {
        resultId: resultId ?? "",
        typebotId,
      },
      { enabled: isDefined(resultId) },
    ),
  );
  if (error && onError) onError(error.message);
  return {
    logs: data?.logs,
    isLoading: !error && !data,
  };
};
