import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/queryClient";

type Params = {
  typebotId: string;
  resultId: string;
};

export const useResultTranscriptQuery = ({ typebotId, resultId }: Params) => {
  return useQuery(
    trpc.results.getResultTranscript.queryOptions({ typebotId, resultId }),
  );
};
