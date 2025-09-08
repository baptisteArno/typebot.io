import { isSelfHostedInstance } from "@/helpers/isSelfHostedInstance";
import { trpc } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

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
