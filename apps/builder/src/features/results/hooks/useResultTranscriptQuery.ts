import { trpc } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

type Params = {
  typebotId: string;
  resultId: string;
};

export const useResultTranscriptQuery = ({ typebotId, resultId }: Params) => {
  return useQuery(
    trpc.results.getResultTranscript.queryOptions({ typebotId, resultId }),
  );
};
