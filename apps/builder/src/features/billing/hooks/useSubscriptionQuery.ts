import { useQuery } from "@tanstack/react-query";
import { isSelfHostedInstance } from "@/helpers/isSelfHostedInstance";
import { trpc } from "@/lib/queryClient";

export const useSubscriptionQuery = (workspaceId: string) => {
  return useQuery(
    trpc.billing.getSubscription.queryOptions(
      {
        workspaceId,
      },
      {
        enabled: !isSelfHostedInstance(),
      },
    ),
  );
};
