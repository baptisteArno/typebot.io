import { trpc } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

export const useTypebots = ({
  folderId,
  workspaceId,
}: {
  workspaceId?: string;
  folderId?: string | "root";
}) => {
  const { data, isLoading, refetch } = useQuery(
    trpc.typebot.listTypebots.queryOptions(
      {
        workspaceId: workspaceId as string,
        folderId,
      },
      {
        enabled: !!workspaceId,
      },
    ),
  );
  return {
    typebots: data?.typebots,
    isLoading,
    refetch,
  };
};
