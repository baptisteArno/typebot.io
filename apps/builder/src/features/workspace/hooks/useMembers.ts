import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/queryClient";

export const useMembers = ({ workspaceId }: { workspaceId?: string }) => {
  const { data, refetch, isLoading } = useQuery(
    orpc.workspace.listMembersInWorkspace.queryOptions({
      input: { workspaceId: workspaceId! },
      enabled: !!workspaceId,
      refetchInterval: false,
    }),
  );
  return {
    members: data?.members ?? [],
    invitations: data?.invitations ?? [],
    isLoading,
    mutate: refetch,
  };
};
