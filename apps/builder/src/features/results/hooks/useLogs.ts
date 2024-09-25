import { trpc } from "@/lib/trpc";
import { isDefined } from "@udecode/plate-common";

export const useLogs = (
  typebotId: string,
  resultId: string | null,
  onError?: (error: string) => void,
) => {
  const { data, error } = trpc.results.getResultLogs.useQuery(
    {
      resultId: resultId ?? "",
      typebotId,
    },
    { enabled: isDefined(resultId) },
  );
  if (error && onError) onError(error.message);
  return {
    logs: data?.logs,
    isLoading: !error && !data,
  };
};
