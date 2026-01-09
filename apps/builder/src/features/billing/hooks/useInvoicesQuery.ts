import { useQuery } from "@tanstack/react-query";
import { isSelfHostedInstance } from "@/helpers/isSelfHostedInstance";
import { orpc } from "@/lib/queryClient";

export const useInvoicesQuery = (workspaceId: string) => {
  return useQuery(
    orpc.billing.listInvoices.queryOptions({
      input: {
        workspaceId,
      },
      enabled: !isSelfHostedInstance(),
    }),
  );
};
