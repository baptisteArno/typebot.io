import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/queryClient";

export const useTypebots = ({
  folderId,
  workspaceId,
}: {
  workspaceId?: string;
  folderId?: string | "root";
}) => {
  const { data, isLoading, refetch } = useQuery(
    orpc.typebot.listTypebots.queryOptions({
      input: {
        workspaceId: workspaceId as string,
        folderId,
      },
      enabled: !!workspaceId,
    }),
  );
  return {
    typebots: data?.typebots,
    isLoading,
    refetch,
  };
};
