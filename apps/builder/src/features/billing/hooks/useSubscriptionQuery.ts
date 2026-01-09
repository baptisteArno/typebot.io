import { useQuery } from "@tanstack/react-query";
import { isSelfHostedInstance } from "@/helpers/isSelfHostedInstance";
import { orpc } from "@/lib/queryClient";

export const useSubscriptionQuery = (workspaceId: string) => {
  return useQuery(
    orpc.billing.getSubscription.queryOptions({
      input: {
        workspaceId,
      },
      enabled: !isSelfHostedInstance(),
    }),
  );
};
