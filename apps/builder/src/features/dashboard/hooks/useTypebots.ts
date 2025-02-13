import { trpc } from "@/lib/trpc";

export const useTypebots = ({
  folderId,
  workspaceId,
  currentUserMode,
  onError,
}: {
  workspaceId?: string;
  folderId?: string | "root";
  currentUserMode?: "guest" | "read" | "write";
  onError: (error: Error) => void;
}) => {
  const { data, isLoading, refetch } = trpc.typebot.listTypebots.useQuery(
    {
      workspaceId: workspaceId as string,
      folderId,
    },
    {
      enabled: !!workspaceId && currentUserMode !== "guest",
      onError: (error) => {
        onError(new Error(error.message));
      },
    },
  );
  return {
    typebots: data?.typebots,
    isLoading,
    refetch,
  };
};
