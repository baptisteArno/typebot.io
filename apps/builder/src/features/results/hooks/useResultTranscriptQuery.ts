import { trpc } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

type Params = {
  typebotId: string;
  resultId: string;
  enabled?: boolean;
};

export const useResultTranscriptQuery = ({
  typebotId,
  resultId,
  enabled = false,
}: Params) => {
  return useQuery(
    trpc.results.getResultTranscript.queryOptions(
      { typebotId, resultId },
      { enabled },
    ),
  );
};
