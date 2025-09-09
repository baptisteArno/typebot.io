import { useQuery } from "@tanstack/react-query";
import { isSelfHostedInstance } from "@/helpers/isSelfHostedInstance";
import { trpc } from "@/lib/queryClient";

export const useInvoicesQuery = (workspaceId: string) => {
  return useQuery(
    trpc.billing.listInvoices.queryOptions(
      {
        workspaceId,
      },
      {
        enabled: !isSelfHostedInstance(),
      },
    ),
  );
};
