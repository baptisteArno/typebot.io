import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/queryClient";

type Params = {
  typebotId: string;
  resultId: string;
};

export const useResultTranscriptQuery = ({ typebotId, resultId }: Params) => {
  return useQuery(
    orpc.results.getResultTranscript.queryOptions({
      input: { typebotId, resultId },
    }),
  );
};
