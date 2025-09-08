import { isSelfHostedInstance } from "@/helpers/isSelfHostedInstance";
import { trpc } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

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
